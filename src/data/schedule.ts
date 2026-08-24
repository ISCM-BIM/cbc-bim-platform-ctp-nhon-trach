import type { BlockId, Discipline, ScheduleItem, ScheduleStatus } from '../types'
import { PROJECT_START, ELAPSED_DAYS } from './constants'
import { createRng, pick, randInt, chance, addDays, clamp } from '../utils/random'

const rng = createRng(3305591)

interface ScheduleTemplate {
  wbsCode: string
  level: number
  name: string
  discipline: Discipline
  block: BlockId | 'Toàn dự án'
  startDay: number
  endDay: number
}

// Trích TOÀN BỘ (không rút gọn) từ "CTP_Master Cons Schedule_Phase 2" (đọc cả file .mpp gốc và
// bản .pdf export cùng tên, "Dữ liệu dự án/", cập nhật 2026-08-24) - 232 dòng công việc thật
// (script trích xuất: pdf-parse đọc text từng trang, ghép lại tên hạng mục bị ngắt dòng do PDF
// export, quy đổi Start/Finish thật thành startDay/endDay - không suy diễn, không làm tròn).
// wbsCode/tên GIỮ NGUYÊN VĂN theo file gốc (song ngữ Việt/Anh, kể cả những dòng nguồn chỉ có
// tiếng Anh như "4.2.1 Main building" - không tự dịch thêm).
//
// Mốc ngày 0 = ngày LOA (25/10/2026, xem PROJECT_START trong constants.ts) - ĐÚNG bằng ngày bắt
// đầu của dòng gốc "0 TIẾN ĐỘ THI CÔNG" trong file MS Project, không phải ngày khởi công.
//
// discipline/block suy ra theo NHÁNH WBS (không có sẵn trong file gốc, xem classify() trong
// script trích xuất - không giữ trong repo):
// - Mục 1/2/3/5/6/7/8 (mốc dự án, thiết kế/xin phép, chuẩn bị & shop drawing, đóng điện-nghiệm
//   thu, PCCC nội bộ, giấy phép sử dụng, sổ hồng) = Hạ tầng, block "Toàn dự án" (không gắn 1
//   hạng mục công trình cụ thể).
// - 4.1 San lấp mặt bằng = Hạ tầng; 4.2 Công tác cọc = Kết cấu (cả 2 đều block A, chung phạm vi
//   RBF6-7).
// - 4.3 RBF6 / 4.4 RBF7: nhánh .1 Phần ngầm/.2 Phần nền/.3 Kết cấu bên trên/.4 Kết cấu thép =
//   Kết cấu, .5 Công tác hoàn thiện = Kiến trúc, .6 Công tác MEPF = MEP - đều block A.
// - 4.5 Khu phụ trợ+bể nước / 4.6 Trạm XLNT / 4.8 Trạm điện 02+Kiosk: nhánh .1 Kết cấu = Kết
//   cấu, .2 Hoàn thiện = Kiến trúc, .3 MEPF = MEP - đều block C (công trình phụ trợ kỹ thuật).
// - 4.7 Bãi đậu xe 02 / 4.9 Hàng rào-cổng-nhà bảo vệ 3: cùng cấu trúc .1/.2/.3 - block D (bãi
//   xe & hàng rào).
// - 4.10 Công tác hạ tầng (thoát nước mưa/thải, cấp nước, đất nền, đá dăm, đường nhựa, bó vỉa,
//   cây xanh...) = Hạ tầng, block B.
const TEMPLATES: ScheduleTemplate[] = [
  { wbsCode: '', level: 0, name: 'TIẾN ĐỘ THI CÔNG / MASTER CONSTRUCTION SCHEDULE', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 0, endDay: 506 },
  { wbsCode: '1', level: 1, name: '1 CÁC MỐC CỦA DỰ ÁN / MILESTONE', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 0, endDay: 506 },
  { wbsCode: '1.1', level: 2, name: '1.1 Thư thông báo trúng thầu / Letter of Acceptance (LOA)', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 0, endDay: 0 },
  { wbsCode: '1.2', level: 2, name: '1.2 Kick off dự án/ Construction Kick off Meeting', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 1, endDay: 1 },
  { wbsCode: '1.3', level: 2, name: '1.3 Ký kết hợp đồng/ Contract signing', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 1, endDay: 7 },
  { wbsCode: '1.4', level: 2, name: '1.4 Khởi công dự án/ Groundbreaking Ceremony', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 7 },
  { wbsCode: '1.5', level: 2, name: '1.5 Dự trù công tác điều chỉnh thiết kế và xin phép/ Estimated timeline for design adjustment and permitting', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 36 },
  { wbsCode: '1.6', level: 2, name: '1.6 Công tác xây dựng/ Construction', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 386 },
  { wbsCode: '1.7', level: 2, name: '1.7 Chủ đầu tư và nhà thầu tự tổ chức nghiệm thu PCCC nội bộ / The investor and the contractor conduct internal fire prevention and fighting (FPF) inspection and acceptance', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 373, endDay: 384 },
  { wbsCode: '1.8', level: 2, name: '1.8 Xin Giấy phép đưa công trình vào sử dụng /Obtain the Occupation Permit', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 387, endDay: 416 },
  { wbsCode: '1.9', level: 2, name: '1.9 Lấy sổ hồng / Obtain the Pink Book', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 417, endDay: 506 },
  { wbsCode: '2', level: 1, name: '2 DỰ TRÙ CÔNG TÁC ĐIỀU CHỈNH THIẾT KẾ VÀ XIN PHÉP / ESTIMATED TIMELINE FOR DESIGN ADJUSTMENT AND PERMITTING', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 36 },
  { wbsCode: '2.1', level: 2, name: '2.1 Điều chỉnh 1/500, Thẩm duyệt PCCC (Nếu có) / Adjustment of 1/500 Detailed Master Plan, Fire Prevention and Fighting Approval (If any)', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 36 },
  { wbsCode: '3', level: 1, name: '3 CÔNG TÁC CHUẨN BỊ & KẾ HOẠCH ĐỆ TRÌNH VẬT TƯ, SHOP DRAWING VÀ BPTC / PRELIMINARY WORK & SUBMISSION SCHDULE FOR MATERIAL & MOS', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 77 },
  { wbsCode: '3.1', level: 2, name: '3.1 Thi công công tác tạm & Huy động nhân lực + Thiết bị / Temporary works & Mobilization of manpower + Equipment', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 66 },
  { wbsCode: '3.1.1', level: 3, name: '3.1.1 Huy động nhân lực / Manpower mobilization', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 51 },
  { wbsCode: '3.1.2', level: 3, name: '3.1.2 Huy động thiết bị thi công / Equipment mobilization', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 66 },
  { wbsCode: '3.1.3', level: 3, name: '3.1.3 San ủi và chuẩn bị thi công văn phòng tạm / Leveling and preparing work for temporary office.', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 13 },
  { wbsCode: '3.1.4', level: 3, name: '3.1.4 Công tác HSSE và cổng tạm / HSSE work and temporary gate', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 21 },
  { wbsCode: '3.1.5', level: 3, name: '3.1.5 Thi công đường tạm / Construction of temporary road', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 21 },
  { wbsCode: '3.1.6', level: 3, name: '3.1.6 Thi công văn phòng tạm / Construction of temporary office', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 21 },
  { wbsCode: '3.1.7', level: 3, name: '3.1.7 Thi công điện, nước tạm / Construction of electricity and water', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 21 },
  { wbsCode: '3.2', level: 2, name: '3.2 Kế hoạch đệ trình Shop Drawing và biện pháp thi công / Shopdrawing and Method statement submission', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 77 },
  { wbsCode: '3.2.1', level: 3, name: '3.2.1 Xây dựng / CSA', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 66 },
  { wbsCode: '3.2.1.1', level: 4, name: '3.2.1.1 Đệ trình và phê duyệt vật tư, thiết bị cho công tác xây dựng / Materials, Equipment submission and approval for CSA', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 7, endDay: 51 },
  { wbsCode: '3.2.1.2', level: 4, name: '3.2.1.2 Đệ trình và phê duyệt biện pháp thi công và Shop drawing cho công tác xây dựng / Method statement and Shop drawing submission and approval for CSA', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 12, endDay: 66 },
  { wbsCode: '3.2.2', level: 3, name: '3.2.2 MEPF', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 12, endDay: 72 },
  { wbsCode: '3.2.2.1', level: 4, name: '3.2.2.1 Đệ trình và phê duyệt vật tư, thiết bị cho công tác xây dựng / Materials, Equipment submission and approval for CSA', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 12, endDay: 56 },
  { wbsCode: '3.2.2.2', level: 4, name: '3.2.2.2 Đệ trình và phê duyệt biện pháp thi công và Shop drawing cho công tác xây dựng / Method statement and Shop drawing submission and approval for CSA', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 17, endDay: 72 },
  { wbsCode: '3.2.3', level: 3, name: '3.2.3 Kết cấu thép / Steel structural', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 12, endDay: 77 },
  { wbsCode: '3.2.3.1', level: 4, name: '3.2.3.1 Trình duyệt shop, phê duyệt và gia công KCT tại nhà máy / Steel structural submission and approval (Shop drawing & Method statement) and Fabrication at factory', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 12, endDay: 72 },
  { wbsCode: '3.2.3.2', level: 4, name: '3.2.3.2 Vận chuyển KCT tới công trường / Delivery to the site', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 47, endDay: 77 },
  { wbsCode: '4', level: 1, name: '4 CÔNG TÁC XÂY DỰNG / CONSTRUCTION', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 9, endDay: 371 },
  { wbsCode: '4.1', level: 2, name: '4.1 San lấp mặt bằng / Site Leveling', discipline: 'Hạ tầng', block: 'A', startDay: 9, endDay: 45 },
  { wbsCode: '4.1.1', level: 3, name: '4.1.1 Cho các nhà xưởng để đạt cao độ thiết kế/ To RBFs to get design level (15,541m3)', discipline: 'Hạ tầng', block: 'A', startDay: 9, endDay: 40 },
  { wbsCode: '4.1.2', level: 3, name: '4.1.2 Cho nền đường quanh các kho để đạt độ dốc thiết kế/ To road area to get design slope (2,161m3)', discipline: 'Hạ tầng', block: 'A', startDay: 41, endDay: 45 },
  { wbsCode: '4.2', level: 2, name: '4.2 Công tác cọc/ Pilling works (1 Robot)', discipline: 'Kết cấu', block: 'A', startDay: 11, endDay: 111 },
  { wbsCode: '4.2.1', level: 3, name: '4.2.1 Main building', discipline: 'Kết cấu', block: 'A', startDay: 11, endDay: 97 },
  { wbsCode: '4.2.1.1', level: 4, name: '4.2.1.1 Cọc thử/ Test Piles (14 piles - D400 (28m))', discipline: 'Kết cấu', block: 'A', startDay: 11, endDay: 36 },
  { wbsCode: '4.2.1.1.1', level: 5, name: '4.2.1.1.1 Vận chuyển cọc thử đến công trình/ Transport test piles to the project site', discipline: 'Kết cấu', block: 'A', startDay: 11, endDay: 11 },
  { wbsCode: '4.2.1.1.2', level: 5, name: '4.2.1.1.2 Thi công ép cọc thử bằng Robot/ Installation of test piles using Robot', discipline: 'Kết cấu', block: 'A', startDay: 12, endDay: 23 },
  { wbsCode: '4.2.1.1.3', level: 5, name: '4.2.1.1.3 Chiều dài cọc đại trà sẽ được chốt sau khi có phê duyệt của Tư vấn Thiết kế/ Production pile length shall be finalized upon approval of the Design Consultant', discipline: 'Kết cấu', block: 'A', startDay: 24, endDay: 24 },
  { wbsCode: '4.2.1.1.4', level: 5, name: '4.2.1.1.4 Thời gian chờ hồi phục ma sát đất nền sau khi thi công cọc thử/ Waiting for soil friction recovery after test pile', discipline: 'Kết cấu', block: 'A', startDay: 12, endDay: 18 },
  { wbsCode: '4.2.1.1.5', level: 5, name: '4.2.1.1.5 Thí nghiệm nén tĩnh / Static load test', discipline: 'Kết cấu', block: 'A', startDay: 19, endDay: 32 },
  { wbsCode: '4.2.1.1.6', level: 5, name: '4.2.1.1.6 Phát hành kết quả thí nghiệm nén tĩnh / Issue static load test results', discipline: 'Kết cấu', block: 'A', startDay: 33, endDay: 36 },
  { wbsCode: '4.2.1.2', level: 4, name: '4.2.1.2 Cọc đại trà/ Mass piles (1182 Piles - D400 (26m))', discipline: 'Kết cấu', block: 'A', startDay: 34, endDay: 97 },
  { wbsCode: '4.2.1.2.1', level: 5, name: '4.2.1.2.1 Kiểm tra nhà máy và sản xuất cọc đại trà/ Factory inspection and Mass pile production', discipline: 'Kết cấu', block: 'A', startDay: 34, endDay: 69 },
  { wbsCode: '4.2.1.2.2', level: 5, name: '4.2.1.2.2 Mass piles (19-20 tim cọc/ ngày, 1 Robot)/ Robot (19-20 piles/ day,1 Robot): 1182 piles', discipline: 'Kết cấu', block: 'A', startDay: 37, endDay: 97 },
  { wbsCode: '4.2.2', level: 3, name: '4.2.2 Other Items', discipline: 'Kết cấu', block: 'A', startDay: 95, endDay: 111 },
  { wbsCode: '4.2.2.1', level: 4, name: '4.2.2.1 Cọc đại trà/ Mass piles (74 Piles - D400 (26m))', discipline: 'Kết cấu', block: 'A', startDay: 95, endDay: 111 },
  { wbsCode: '4.2.2.1.1', level: 5, name: '4.2.2.1.1 Kiểm tra nhà máy và sản xuất cọc đại trà/ Factory inspection and Mass pile production', discipline: 'Kết cấu', block: 'A', startDay: 95, endDay: 97 },
  { wbsCode: '4.2.2.1.2', level: 5, name: '4.2.2.1.2 Mass piles (19-20 tim cọc/ ngày, 1 Robot)/ Robot (19-20 piles/ day, 1 Robot): 74 piles', discipline: 'Kết cấu', block: 'A', startDay: 98, endDay: 111 },
  { wbsCode: '4.3', level: 2, name: '4.3 RBF6', discipline: 'Kết cấu', block: 'A', startDay: 71, endDay: 298 },
  { wbsCode: '4.3.1', level: 3, name: '4.3.1 Phần ngầm (Móng + Cổ cột + Đà kiềng) / Under ground (Foundation, Stump column and Ground beam)', discipline: 'Kết cấu', block: 'A', startDay: 71, endDay: 142 },
  { wbsCode: '4.3.1.1', level: 4, name: '4.3.1.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 71, endDay: 118 },
  { wbsCode: '4.3.1.1.1', level: 5, name: '4.3.1.1.1 Đào đất đến cao độ thiết kế và cắt đầu cọc / Excavation to design level and cut head pile', discipline: 'Kết cấu', block: 'A', startDay: 71, endDay: 78 },
  { wbsCode: '4.3.1.1.2', level: 5, name: '4.3.1.1.2 Thi công đầm chặt đất và bê tông lót / Well compacted and construction lean concrete', discipline: 'Kết cấu', block: 'A', startDay: 72, endDay: 79 },
  { wbsCode: '4.3.1.1.3', level: 5, name: '4.3.1.1.3 Lắp đặt thép, ván khuôn và bê tông cho móng / Installing rebar, formwork, concrete for foundation', discipline: 'Kết cấu', block: 'A', startDay: 73, endDay: 97 },
  { wbsCode: '4.3.1.1.4', level: 5, name: '4.3.1.1.4 Lắp đặt thép, ván khuôn và bê tông cho cổ cột / Installing rebar, formwork, concrete for stump column', discipline: 'Kết cấu', block: 'A', startDay: 78, endDay: 112 },
  { wbsCode: '4.3.1.1.5', level: 5, name: '4.3.1.1.5 Thi công đà kiềng / Installing rebar, formwork, concrete for ground beam', discipline: 'Kết cấu', block: 'A', startDay: 82, endDay: 116 },
  { wbsCode: '4.3.1.1.6', level: 5, name: '4.3.1.1.6 Đắp đất cho móng, cổ cột và đà kiềng / Backfilling for foundation, stump column and ground beam', discipline: 'Kết cấu', block: 'A', startDay: 112, endDay: 118 },
  { wbsCode: '4.3.1.2', level: 4, name: '4.3.1.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 79, endDay: 126 },
  { wbsCode: '4.3.1.3', level: 4, name: '4.3.1.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 87, endDay: 134 },
  { wbsCode: '4.3.1.4', level: 4, name: '4.3.1.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 95, endDay: 142 },
  { wbsCode: '4.3.2', level: 3, name: '4.3.2 Phần nền (Đầm đất) / Ground (Well compacted)', discipline: 'Kết cấu', block: 'A', startDay: 115, endDay: 159 },
  { wbsCode: '4.3.2.1', level: 4, name: '4.3.2.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 115, endDay: 135 },
  { wbsCode: '4.3.2.1.1', level: 5, name: '4.3.2.1.1 Nền đầm chặt (k≥0.95) / Well compacted (k≥0.95)', discipline: 'Kết cấu', block: 'A', startDay: 115, endDay: 121 },
  { wbsCode: '4.3.2.1.2', level: 5, name: '4.3.2.1.2 Lớp đá 0x40 (k≥0.98) / Stone 0x40 (k≥0.98)', discipline: 'Kết cấu', block: 'A', startDay: 122, endDay: 135 },
  { wbsCode: '4.3.2.2', level: 4, name: '4.3.2.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 123, endDay: 143 },
  { wbsCode: '4.3.2.3', level: 4, name: '4.3.2.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 131, endDay: 151 },
  { wbsCode: '4.3.2.4', level: 4, name: '4.3.2.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 139, endDay: 159 },
  { wbsCode: '4.3.3', level: 3, name: '4.3.3 Kết cấu bên trên / Upper Structure', discipline: 'Kết cấu', block: 'A', startDay: 123, endDay: 231 },
  { wbsCode: '4.3.3.1', level: 4, name: '4.3.3.1 Nhà xưởng / Factory', discipline: 'Kết cấu', block: 'A', startDay: 123, endDay: 231 },
  { wbsCode: '4.3.3.1.1', level: 5, name: '4.3.3.1.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 123, endDay: 168 },
  { wbsCode: '4.3.3.1.1.1', level: 6, name: '4.3.3.1.1.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 123, endDay: 142 },
  { wbsCode: '4.3.3.1.1.2', level: 6, name: '4.3.3.1.1.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 128, endDay: 147 },
  { wbsCode: '4.3.3.1.1.3', level: 6, name: '4.3.3.1.1.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 155, endDay: 168 },
  { wbsCode: '4.3.3.1.2', level: 5, name: '4.3.3.1.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 143, endDay: 191 },
  { wbsCode: '4.3.3.1.2.1', level: 6, name: '4.3.3.1.2.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 143, endDay: 162 },
  { wbsCode: '4.3.3.1.2.2', level: 6, name: '4.3.3.1.2.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 148, endDay: 167 },
  { wbsCode: '4.3.3.1.2.3', level: 6, name: '4.3.3.1.2.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 175, endDay: 191 },
  { wbsCode: '4.3.3.1.3', level: 5, name: '4.3.3.1.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 163, endDay: 211 },
  { wbsCode: '4.3.3.1.3.1', level: 6, name: '4.3.3.1.3.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 163, endDay: 182 },
  { wbsCode: '4.3.3.1.3.2', level: 6, name: '4.3.3.1.3.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 168, endDay: 190 },
  { wbsCode: '4.3.3.1.3.3', level: 6, name: '4.3.3.1.3.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 198, endDay: 211 },
  { wbsCode: '4.3.3.1.4', level: 5, name: '4.3.3.1.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 184, endDay: 231 },
  { wbsCode: '4.3.3.1.4.1', level: 6, name: '4.3.3.1.4.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 184, endDay: 205 },
  { wbsCode: '4.3.3.1.4.2', level: 6, name: '4.3.3.1.4.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 191, endDay: 210 },
  { wbsCode: '4.3.3.1.4.3', level: 6, name: '4.3.3.1.4.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 218, endDay: 231 },
  { wbsCode: '4.3.3.2', level: 4, name: '4.3.3.2 Nhà văn phòng / Office', discipline: 'Kết cấu', block: 'A', startDay: 137, endDay: 214 },
  { wbsCode: '4.3.3.2.1', level: 5, name: '4.3.3.2.1 Tầng 1 / First floor', discipline: 'Kết cấu', block: 'A', startDay: 137, endDay: 157 },
  { wbsCode: '4.3.3.2.1.1', level: 6, name: '4.3.3.2.1.1 Thi công dầm sàn tầng 1 / Construction for first floor', discipline: 'Kết cấu', block: 'A', startDay: 137, endDay: 148 },
  { wbsCode: '4.3.3.2.1.2', level: 6, name: '4.3.3.2.1.2 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 149, endDay: 157 },
  { wbsCode: '4.3.3.2.2', level: 5, name: '4.3.3.2.2 Tầng 2 / Second floor (+4.500m)', discipline: 'Kết cấu', block: 'A', startDay: 151, endDay: 171 },
  { wbsCode: '4.3.3.2.2.1', level: 6, name: '4.3.3.2.2.1 Thi công dầm sàn tầng 2 / Construction for Second floor', discipline: 'Kết cấu', block: 'A', startDay: 151, endDay: 162 },
  { wbsCode: '4.3.3.2.2.2', level: 6, name: '4.3.3.2.2.2 Thi công cột tầng 2 / Construction for Second column', discipline: 'Kết cấu', block: 'A', startDay: 163, endDay: 171 },
  { wbsCode: '4.3.3.2.3', level: 5, name: '4.3.3.2.3 Tầng 3 / Third floor (+9.000m)', discipline: 'Kết cấu', block: 'A', startDay: 165, endDay: 186 },
  { wbsCode: '4.3.3.2.3.1', level: 6, name: '4.3.3.2.3.1 Thi công dầm sàn tầng 3 / Construction for Third floor', discipline: 'Kết cấu', block: 'A', startDay: 165, endDay: 176 },
  { wbsCode: '4.3.3.2.3.2', level: 6, name: '4.3.3.2.3.2 Thi công cột tầng 3 / Construction for Third column', discipline: 'Kết cấu', block: 'A', startDay: 177, endDay: 186 },
  { wbsCode: '4.3.3.2.4', level: 5, name: '4.3.3.2.4 Tầng 4 / Fourth floor (+12.500m)', discipline: 'Kết cấu', block: 'A', startDay: 179, endDay: 202 },
  { wbsCode: '4.3.3.2.4.1', level: 6, name: '4.3.3.2.4.1 Thi công dầm sàn tầng 4 / Construction for Fourth floor', discipline: 'Kết cấu', block: 'A', startDay: 179, endDay: 193 },
  { wbsCode: '4.3.3.2.4.2', level: 6, name: '4.3.3.2.4.2 Thi công cột tầng 4 / Construction for Fourth column', discipline: 'Kết cấu', block: 'A', startDay: 194, endDay: 202 },
  { wbsCode: '4.3.3.2.5', level: 5, name: '4.3.3.2.5 Tầng mái / Roof floor (+16.000m)', discipline: 'Kết cấu', block: 'A', startDay: 196, endDay: 207 },
  { wbsCode: '4.3.3.2.5.1', level: 6, name: '4.3.3.2.5.1 Thi công dầm sàn tầng mái / Construction for Roof floor', discipline: 'Kết cấu', block: 'A', startDay: 196, endDay: 207 },
  { wbsCode: '4.3.3.2.6', level: 5, name: '4.3.3.2.6 Công tác khác / Other works', discipline: 'Kết cấu', block: 'A', startDay: 194, endDay: 214 },
  { wbsCode: '4.3.4', level: 3, name: '4.3.4 Kết cấu thép / Steel structural', discipline: 'Kết cấu', block: 'A', startDay: 202, endDay: 271 },
  { wbsCode: '4.3.4.1', level: 4, name: '4.3.4.1 Lắp dựng cột thép / Steel Column Erection', discipline: 'Kết cấu', block: 'A', startDay: 202, endDay: 231 },
  { wbsCode: '4.3.4.2', level: 4, name: '4.3.4.2 Lắp dựng kèo thép và xà gồ mái / Steel Rafter Erection + Purlin Erection', discipline: 'Kết cấu', block: 'A', startDay: 217, endDay: 246 },
  { wbsCode: '4.3.4.3', level: 4, name: '4.3.4.3 Lắp dựng tôn mái, thoát nước / Roofing sheet, Gutter erection', discipline: 'Kết cấu', block: 'A', startDay: 237, endDay: 256 },
  { wbsCode: '4.3.4.4', level: 4, name: '4.3.4.4 Lắp dựng tôn vách / Corrugated sheet wall', discipline: 'Kết cấu', block: 'A', startDay: 247, endDay: 271 },
  { wbsCode: '4.3.4.5', level: 4, name: '4.3.4.5 Các công tác khác / Other works', discipline: 'Kết cấu', block: 'A', startDay: 252, endDay: 271 },
  { wbsCode: '4.3.5', level: 3, name: '4.3.5 Công tác hoàn thiện / Finishing works', discipline: 'Kiến trúc', block: 'A', startDay: 165, endDay: 292 },
  { wbsCode: '4.3.5.1', level: 4, name: '4.3.5.1 Thi công tường gạch / Brick wall', discipline: 'Kiến trúc', block: 'A', startDay: 165, endDay: 247 },
  { wbsCode: '4.3.5.2', level: 4, name: '4.3.5.2 Trát tường gạch / Plastering for wall', discipline: 'Kiến trúc', block: 'A', startDay: 175, endDay: 257 },
  { wbsCode: '4.3.5.3', level: 4, name: '4.3.5.3 Công tác trần / Ceilling work', discipline: 'Kiến trúc', block: 'A', startDay: 186, endDay: 237 },
  { wbsCode: '4.3.5.4', level: 4, name: '4.3.5.4 Công tác sơn / Paint work', discipline: 'Kiến trúc', block: 'A', startDay: 180, endDay: 262 },
  { wbsCode: '4.3.5.5', level: 4, name: '4.3.5.5 Hoàn thiện sàn: Liquid Hardener / Floor finishing: Liquid Hardener', discipline: 'Kiến trúc', block: 'A', startDay: 176, endDay: 262 },
  { wbsCode: '4.3.5.6', level: 4, name: '4.3.5.6 Công tác ốp lát / Tilling work', discipline: 'Kiến trúc', block: 'A', startDay: 194, endDay: 243 },
  { wbsCode: '4.3.5.7', level: 4, name: '4.3.5.7 Công tác cửa / Door and window', discipline: 'Kiến trúc', block: 'A', startDay: 203, endDay: 277 },
  { wbsCode: '4.3.5.8', level: 4, name: '4.3.5.8 Công tác khác / Other finishing', discipline: 'Kiến trúc', block: 'A', startDay: 263, endDay: 292 },
  { wbsCode: '4.3.6', level: 3, name: '4.3.6 Công tác MEPF / MEPF works', discipline: 'MEP', block: 'A', startDay: 131, endDay: 298 },
  { wbsCode: '4.4', level: 2, name: '4.4 RBF7', discipline: 'Kết cấu', block: 'A', startDay: 154, endDay: 371 },
  { wbsCode: '4.4.1', level: 3, name: '4.4.1 Phần ngầm (Móng + Cổ cột + Đà kiềng) / Under ground (Foundation, Stump column and Ground beam)', discipline: 'Kết cấu', block: 'A', startDay: 154, endDay: 218 },
  { wbsCode: '4.4.1.1', level: 4, name: '4.4.1.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 154, endDay: 194 },
  { wbsCode: '4.4.1.1.1', level: 5, name: '4.4.1.1.1 Đào đất đến cao độ thiết kế và cắt đầu cọc / Excavation to design level and cut head pile', discipline: 'Kết cấu', block: 'A', startDay: 154, endDay: 161 },
  { wbsCode: '4.4.1.1.2', level: 5, name: '4.4.1.1.2 Thi công đầm chặt đất và bê tông lót / Well compacted and construction lean concrete', discipline: 'Kết cấu', block: 'A', startDay: 155, endDay: 162 },
  { wbsCode: '4.4.1.1.3', level: 5, name: '4.4.1.1.3 Lắp đặt thép, ván khuôn và bê tông cho móng / Installing rebar, formwork, concrete for foundation', discipline: 'Kết cấu', block: 'A', startDay: 156, endDay: 180 },
  { wbsCode: '4.4.1.1.4', level: 5, name: '4.4.1.1.4 Lắp đặt thép, ván khuôn và bê tông cho cổ cột / Installing rebar, formwork, concrete for stump column', discipline: 'Kết cấu', block: 'A', startDay: 161, endDay: 186 },
  { wbsCode: '4.4.1.1.5', level: 5, name: '4.4.1.1.5 Thi công đà kiềng / Installing rebar, formwork, concrete for ground beam', discipline: 'Kết cấu', block: 'A', startDay: 165, endDay: 192 },
  { wbsCode: '4.4.1.1.6', level: 5, name: '4.4.1.1.6 Đắp đất cho móng, cổ cột và đà kiềng / Backfilling for foundation, stump column and ground beam', discipline: 'Kết cấu', block: 'A', startDay: 186, endDay: 194 },
  { wbsCode: '4.4.1.2', level: 4, name: '4.4.1.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 162, endDay: 202 },
  { wbsCode: '4.4.1.3', level: 4, name: '4.4.1.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 170, endDay: 210 },
  { wbsCode: '4.4.1.4', level: 4, name: '4.4.1.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 178, endDay: 218 },
  { wbsCode: '4.4.2', level: 3, name: '4.4.2 Phần nền (Đầm đất) / Ground (Well compacted)', discipline: 'Kết cấu', block: 'A', startDay: 191, endDay: 235 },
  { wbsCode: '4.4.2.1', level: 4, name: '4.4.2.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 191, endDay: 211 },
  { wbsCode: '4.4.2.1.1', level: 5, name: '4.4.2.1.1 Nền đầm chặt (k≥0.95) / Well compacted (k≥0.95)', discipline: 'Kết cấu', block: 'A', startDay: 191, endDay: 197 },
  { wbsCode: '4.4.2.1.2', level: 5, name: '4.4.2.1.2 Lớp đá 0x40 (k≥0.98) / Stone 0x40 (k≥0.98)', discipline: 'Kết cấu', block: 'A', startDay: 198, endDay: 211 },
  { wbsCode: '4.4.2.2', level: 4, name: '4.4.2.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 199, endDay: 219 },
  { wbsCode: '4.4.2.3', level: 4, name: '4.4.2.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 207, endDay: 227 },
  { wbsCode: '4.4.2.4', level: 4, name: '4.4.2.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 215, endDay: 235 },
  { wbsCode: '4.4.3', level: 3, name: '4.4.3 Kết cấu bên trên / Upper Structure', discipline: 'Kết cấu', block: 'A', startDay: 199, endDay: 304 },
  { wbsCode: '4.4.3.1', level: 4, name: '4.4.3.1 Nhà xưởng / Factory', discipline: 'Kết cấu', block: 'A', startDay: 199, endDay: 304 },
  { wbsCode: '4.4.3.1.1', level: 5, name: '4.4.3.1.1 Zone 1', discipline: 'Kết cấu', block: 'A', startDay: 199, endDay: 244 },
  { wbsCode: '4.4.3.1.1.1', level: 6, name: '4.4.3.1.1.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 199, endDay: 218 },
  { wbsCode: '4.4.3.1.1.2', level: 6, name: '4.4.3.1.1.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 204, endDay: 223 },
  { wbsCode: '4.4.3.1.1.3', level: 6, name: '4.4.3.1.1.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 231, endDay: 244 },
  { wbsCode: '4.4.3.1.2', level: 5, name: '4.4.3.1.2 Zone 2', discipline: 'Kết cấu', block: 'A', startDay: 219, endDay: 264 },
  { wbsCode: '4.4.3.1.2.1', level: 6, name: '4.4.3.1.2.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 219, endDay: 238 },
  { wbsCode: '4.4.3.1.2.2', level: 6, name: '4.4.3.1.2.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 224, endDay: 243 },
  { wbsCode: '4.4.3.1.2.3', level: 6, name: '4.4.3.1.2.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 251, endDay: 264 },
  { wbsCode: '4.4.3.1.3', level: 5, name: '4.4.3.1.3 Zone 3', discipline: 'Kết cấu', block: 'A', startDay: 239, endDay: 284 },
  { wbsCode: '4.4.3.1.3.1', level: 6, name: '4.4.3.1.3.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 239, endDay: 258 },
  { wbsCode: '4.4.3.1.3.2', level: 6, name: '4.4.3.1.3.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 244, endDay: 263 },
  { wbsCode: '4.4.3.1.3.3', level: 6, name: '4.4.3.1.3.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 271, endDay: 284 },
  { wbsCode: '4.4.3.1.4', level: 5, name: '4.4.3.1.4 Zone 4', discipline: 'Kết cấu', block: 'A', startDay: 259, endDay: 304 },
  { wbsCode: '4.4.3.1.4.1', level: 6, name: '4.4.3.1.4.1 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 259, endDay: 278 },
  { wbsCode: '4.4.3.1.4.2', level: 6, name: '4.4.3.1.4.2 Thi công dầm sàn cao độ +9.000m / Construction for second floor at +9.000m', discipline: 'Kết cấu', block: 'A', startDay: 264, endDay: 283 },
  { wbsCode: '4.4.3.1.4.3', level: 6, name: '4.4.3.1.4.3 Thi công dầm sàn tầng trệt / Construction for ground floor', discipline: 'Kết cấu', block: 'A', startDay: 291, endDay: 304 },
  { wbsCode: '4.4.3.2', level: 4, name: '4.4.3.2 Nhà văn phòng / Office', discipline: 'Kết cấu', block: 'A', startDay: 213, endDay: 287 },
  { wbsCode: '4.4.3.2.1', level: 5, name: '4.4.3.2.1 Tầng 1 / First floor', discipline: 'Kết cấu', block: 'A', startDay: 213, endDay: 233 },
  { wbsCode: '4.4.3.2.1.1', level: 6, name: '4.4.3.2.1.1 Thi công dầm sàn tầng 1 / Construction for first floor', discipline: 'Kết cấu', block: 'A', startDay: 213, endDay: 224 },
  { wbsCode: '4.4.3.2.1.2', level: 6, name: '4.4.3.2.1.2 Thi công cột tầng trệt / Construction for Ground column', discipline: 'Kết cấu', block: 'A', startDay: 225, endDay: 233 },
  { wbsCode: '4.4.3.2.2', level: 5, name: '4.4.3.2.2 Tầng 2 / Second floor (+4.500m)', discipline: 'Kết cấu', block: 'A', startDay: 227, endDay: 247 },
  { wbsCode: '4.4.3.2.2.1', level: 6, name: '4.4.3.2.2.1 Thi công dầm sàn tầng 2 / Construction for Second floor', discipline: 'Kết cấu', block: 'A', startDay: 227, endDay: 238 },
  { wbsCode: '4.4.3.2.2.2', level: 6, name: '4.4.3.2.2.2 Thi công cột tầng 2 / Construction for Second column', discipline: 'Kết cấu', block: 'A', startDay: 239, endDay: 247 },
  { wbsCode: '4.4.3.2.3', level: 5, name: '4.4.3.2.3 Tầng 3 / Third floor (+9.000m)', discipline: 'Kết cấu', block: 'A', startDay: 241, endDay: 261 },
  { wbsCode: '4.4.3.2.3.1', level: 6, name: '4.4.3.2.3.1 Thi công dầm sàn tầng 3 / Construction for Third floor', discipline: 'Kết cấu', block: 'A', startDay: 241, endDay: 252 },
  { wbsCode: '4.4.3.2.3.2', level: 6, name: '4.4.3.2.3.2 Thi công cột tầng 3 / Construction for Third column', discipline: 'Kết cấu', block: 'A', startDay: 253, endDay: 261 },
  { wbsCode: '4.4.3.2.4', level: 5, name: '4.4.3.2.4 Tầng 4 / Fourth floor (+12.500m)', discipline: 'Kết cấu', block: 'A', startDay: 255, endDay: 275 },
  { wbsCode: '4.4.3.2.4.1', level: 6, name: '4.4.3.2.4.1 Thi công dầm sàn tầng 4 / Construction for Fourth floor', discipline: 'Kết cấu', block: 'A', startDay: 255, endDay: 266 },
  { wbsCode: '4.4.3.2.4.2', level: 6, name: '4.4.3.2.4.2 Thi công cột tầng 4 / Construction for Fourth column', discipline: 'Kết cấu', block: 'A', startDay: 267, endDay: 275 },
  { wbsCode: '4.4.3.2.5', level: 5, name: '4.4.3.2.5 Tầng mái / Roof floor (+16.000m)', discipline: 'Kết cấu', block: 'A', startDay: 269, endDay: 280 },
  { wbsCode: '4.4.3.2.5.1', level: 6, name: '4.4.3.2.5.1 Thi công dầm sàn tầng mái / Construction for Roof floor', discipline: 'Kết cấu', block: 'A', startDay: 269, endDay: 280 },
  { wbsCode: '4.4.3.2.6', level: 5, name: '4.4.3.2.6 Công tác khác / Other works', discipline: 'Kết cấu', block: 'A', startDay: 267, endDay: 287 },
  { wbsCode: '4.4.4', level: 3, name: '4.4.4 Kết cấu thép / Steel structural', discipline: 'Kết cấu', block: 'A', startDay: 275, endDay: 344 },
  { wbsCode: '4.4.4.1', level: 4, name: '4.4.4.1 Lắp dựng cột thép / Steel Column Erection', discipline: 'Kết cấu', block: 'A', startDay: 275, endDay: 304 },
  { wbsCode: '4.4.4.2', level: 4, name: '4.4.4.2 Lắp dựng kèo thép và xà gồ mái / Steel Rafter Erection + Purlin Erection', discipline: 'Kết cấu', block: 'A', startDay: 290, endDay: 319 },
  { wbsCode: '4.4.4.3', level: 4, name: '4.4.4.3 Lắp dựng tôn mái, thoát nước / Roofing sheet, Gutter erection', discipline: 'Kết cấu', block: 'A', startDay: 310, endDay: 329 },
  { wbsCode: '4.4.4.4', level: 4, name: '4.4.4.4 Lắp dựng tôn vách / Corrugated sheet wall', discipline: 'Kết cấu', block: 'A', startDay: 320, endDay: 344 },
  { wbsCode: '4.4.4.5', level: 4, name: '4.4.4.5 Các công tác khác / Other works', discipline: 'Kết cấu', block: 'A', startDay: 325, endDay: 344 },
  { wbsCode: '4.4.5', level: 3, name: '4.4.5 Công tác hoàn thiện / Finishing works', discipline: 'Kiến trúc', block: 'A', startDay: 241, endDay: 365 },
  { wbsCode: '4.4.5.1', level: 4, name: '4.4.5.1 Thi công tường gạch / Brick wall', discipline: 'Kiến trúc', block: 'A', startDay: 241, endDay: 320 },
  { wbsCode: '4.4.5.2', level: 4, name: '4.4.5.2 Trát tường gạch / Plastering for wall', discipline: 'Kiến trúc', block: 'A', startDay: 251, endDay: 330 },
  { wbsCode: '4.4.5.3', level: 4, name: '4.4.5.3 Công tác trần / Ceilling work', discipline: 'Kiến trúc', block: 'A', startDay: 261, endDay: 310 },
  { wbsCode: '4.4.5.4', level: 4, name: '4.4.5.4 Công tác sơn / Paint work', discipline: 'Kiến trúc', block: 'A', startDay: 256, endDay: 335 },
  { wbsCode: '4.4.5.5', level: 4, name: '4.4.5.5 Hoàn thiện sàn: Liquid Hardener / Floor finishing: Liquid Hardener', discipline: 'Kiến trúc', block: 'A', startDay: 252, endDay: 335 },
  { wbsCode: '4.4.5.6', level: 4, name: '4.4.5.6 Công tác ốp lát / Tilling work', discipline: 'Kiến trúc', block: 'A', startDay: 267, endDay: 316 },
  { wbsCode: '4.4.5.7', level: 4, name: '4.4.5.7 Công tác cửa / Door and window', discipline: 'Kiến trúc', block: 'A', startDay: 276, endDay: 350 },
  { wbsCode: '4.4.5.8', level: 4, name: '4.4.5.8 Công tác khác / Other finishing', discipline: 'Kiến trúc', block: 'A', startDay: 336, endDay: 365 },
  { wbsCode: '4.4.6', level: 3, name: '4.4.6 Công tác MEPF / MEPF works', discipline: 'MEP', block: 'A', startDay: 207, endDay: 371 },
  { wbsCode: '4.5', level: 2, name: '4.5 Khu phụ trợ và bể nước / Utility and Water tank', discipline: 'Kết cấu', block: 'C', startDay: 67, endDay: 152 },
  { wbsCode: '4.5.1', level: 3, name: '4.5.1 Kết cấu / Structure', discipline: 'Kết cấu', block: 'C', startDay: 67, endDay: 127 },
  { wbsCode: '4.5.2', level: 3, name: '4.5.2 Hoàn thiện / Finishing', discipline: 'Kiến trúc', block: 'C', startDay: 88, endDay: 142 },
  { wbsCode: '4.5.3', level: 3, name: '4.5.3 MEPF', discipline: 'MEP', block: 'C', startDay: 98, endDay: 152 },
  { wbsCode: '4.6', level: 2, name: '4.6 Trạm XLNT / WWTP', discipline: 'Kết cấu', block: 'C', startDay: 47, endDay: 147 },
  { wbsCode: '4.6.1', level: 3, name: '4.6.1 Kết cấu / Structure', discipline: 'Kết cấu', block: 'C', startDay: 47, endDay: 117 },
  { wbsCode: '4.6.2', level: 3, name: '4.6.2 Hoàn thiện / Finishing', discipline: 'Kiến trúc', block: 'C', startDay: 83, endDay: 137 },
  { wbsCode: '4.6.3', level: 3, name: '4.6.3 MEPF', discipline: 'MEP', block: 'C', startDay: 93, endDay: 147 },
  { wbsCode: '4.7', level: 2, name: '4.7 Bãi đậu xe 02 / Parking 02', discipline: 'Kết cấu', block: 'D', startDay: 128, endDay: 190 },
  { wbsCode: '4.7.1', level: 3, name: '4.7.1 Kết cấu / Structure', discipline: 'Kết cấu', block: 'D', startDay: 128, endDay: 167 },
  { wbsCode: '4.7.2', level: 3, name: '4.7.2 Hoàn thiện / Finishing', discipline: 'Kiến trúc', block: 'D', startDay: 148, endDay: 177 },
  { wbsCode: '4.7.3', level: 3, name: '4.7.3 MEPF', discipline: 'MEP', block: 'D', startDay: 158, endDay: 190 },
  { wbsCode: '4.8', level: 2, name: '4.8 Trạm điện 01 và bợ đỡ trạm điện / Power Station 02 and Kiosk Station', discipline: 'Kết cấu', block: 'C', startDay: 168, endDay: 230 },
  { wbsCode: '4.8.1', level: 3, name: '4.8.1 Kết cấu / Structure', discipline: 'Kết cấu', block: 'C', startDay: 168, endDay: 210 },
  { wbsCode: '4.8.2', level: 3, name: '4.8.2 Hoàn thiện / Finishing', discipline: 'Kiến trúc', block: 'C', startDay: 191, endDay: 220 },
  { wbsCode: '4.8.3', level: 3, name: '4.8.3 MEPF', discipline: 'MEP', block: 'C', startDay: 201, endDay: 230 },
  { wbsCode: '4.9', level: 2, name: '4.9 Hàng rào, biển hiệu và nhà bảo vệ 3/ Fence, Gate and Guardhouse 3', discipline: 'Kết cấu', block: 'D', startDay: 72, endDay: 264 },
  { wbsCode: '4.9.1', level: 3, name: '4.9.1 Kết cấu / Structure', discipline: 'Kết cấu', block: 'D', startDay: 72, endDay: 234 },
  { wbsCode: '4.9.2', level: 3, name: '4.9.2 Hoàn thiện / Finishing', discipline: 'Kiến trúc', block: 'D', startDay: 225, endDay: 254 },
  { wbsCode: '4.9.3', level: 3, name: '4.9.3 MEPF', discipline: 'MEP', block: 'D', startDay: 235, endDay: 264 },
  { wbsCode: '4.10', level: 2, name: '4.10 Công tác hạ tầng / Infrastructure', discipline: 'Hạ tầng', block: 'B', startDay: 72, endDay: 334 },
  { wbsCode: '4.10.1', level: 3, name: '4.10.1 Thi công thoát nước mưa / Rainwater drainage system', discipline: 'Hạ tầng', block: 'B', startDay: 72, endDay: 141 },
  { wbsCode: '4.10.2', level: 3, name: '4.10.2 Thi công thoát nước thải / Wastewater drainage system', discipline: 'Hạ tầng', block: 'B', startDay: 132, endDay: 194 },
  { wbsCode: '4.10.3', level: 3, name: '4.10.3 Thi công cấp nước / Water supply system', discipline: 'Hạ tầng', block: 'B', startDay: 182, endDay: 244 },
  { wbsCode: '4.10.4', level: 3, name: '4.10.4 Thi công đất nền đầm chặt K≥95 / Ground base, Compacted K>=0.95', discipline: 'Hạ tầng', block: 'B', startDay: 205, endDay: 249 },
  { wbsCode: '4.10.5', level: 3, name: '4.10.5 Thi công cấp phối đá dăm K≥98 / Aggregate, Compacted K>=0.98', discipline: 'Hạ tầng', block: 'B', startDay: 225, endDay: 269 },
  { wbsCode: '4.10.6', level: 3, name: '4.10.6 Thi công đường nhựa/ Construction for Asphalt road', discipline: 'Hạ tầng', block: 'B', startDay: 245, endDay: 289 },
  { wbsCode: '4.10.7', level: 3, name: '4.10.7 Thi công bó vỉa / Road curb', discipline: 'Hạ tầng', block: 'B', startDay: 275, endDay: 304 },
  { wbsCode: '4.10.8', level: 3, name: '4.10.8 Công tác cây xanh / Softcape Works', discipline: 'Hạ tầng', block: 'B', startDay: 275, endDay: 304 },
  { wbsCode: '4.10.9', level: 3, name: '4.10.9 Công tác khác / Other works', discipline: 'Hạ tầng', block: 'B', startDay: 305, endDay: 334 },
  { wbsCode: '5', level: 1, name: '5 ĐÓNG ĐIỆN, SỬA CHỮA LỖI VÀ NGHIỆM THU / POWER ON, DEFECT AND TESTING', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 362, endDay: 386 },
  { wbsCode: '5.1', level: 2, name: '5.1 Đóng điện / Power on', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 362, endDay: 362 },
  { wbsCode: '5.2', level: 2, name: '5.2 Khắc phục lỗi và kiểm tra nghiệm thu / Defect rectification and inspection', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 363, endDay: 374 },
  { wbsCode: '5.3', level: 2, name: '5.3 Hướng dẫn sử dụng cho CĐT công tác Xây dựng, MEPF / Instructions for CSA, MEPF', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 375, endDay: 384 },
  { wbsCode: '5.4', level: 2, name: '5.4 Hoàn thành công tác xây dựng và bàn giao cho Chủ Đầu Tư / Complete construction and project hanover to the Owner', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 385, endDay: 386 },
  { wbsCode: '6', level: 1, name: '6 CHỦ ĐẦU TƯ VÀ NHÀ THẦU TỰ TỔ CHỨC NGHIỆM THU PCCC NỘI BỘ / THE INVESTOR AND THE CONTRACTOR CONDUCT INTERNAL FIRE PREVENTION AND FIGHTING (FPF) INSPECTION AND ACCEPTANCE', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 373, endDay: 384 },
  { wbsCode: '6.1', level: 2, name: '6.1 Tổ chức nghiệm thu PCCC / Organize Internal FPF Inspection and Acceptance', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 373, endDay: 379 },
  { wbsCode: '6.2', level: 2, name: '6.2 Các bên ký xác nhận nghiệm thu / The parties sign to confirm the inspection and acceptance', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 380, endDay: 384 },
  { wbsCode: '7', level: 1, name: '7 XIN GIẤY PHÉP ĐƯA CÔNG TRÌNH VÀO SỬ DỤNG / OBTAIN THE OCCUPATION PERMIT', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 387, endDay: 416 },
  { wbsCode: '7.1', level: 2, name: '7.1 Xin Giấy phép đưa công trình vào sử dụng /Obtain the Occupation Permit', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 387, endDay: 416 },
  { wbsCode: '8', level: 1, name: '8 GIẤY CHỨNG NHẬN QUYỀN SỞ HỮU CÔNG TRÌNH XÂY DỰNG / CERTIFICATE OF CONSTRUCTION OWNERSHIP', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 417, endDay: 506 },
  { wbsCode: '8.1', level: 2, name: '8.1 Lấy sổ hồng / Obtain the Pink Book', discipline: 'Hạ tầng', block: 'Toàn dự án', startDay: 417, endDay: 506 },
]

// ----- Xây dựng cây cha-con TỪ danh sách phẳng (đúng thứ tự pre-order như file gốc) -----
// Thuật toán "stack" chuẩn cho outline lồng nhau: mỗi dòng đẩy lên stack, dòng sau có level nhỏ
// hơn/bằng thì pop bớt - đỉnh stack còn lại (nếu có) chính là cha trực tiếp.
function buildChildrenMap(templates: ScheduleTemplate[]): Map<number, number[]> {
  const childrenOf = new Map<number, number[]>()
  const stack: { index: number; level: number }[] = []
  templates.forEach((t, i) => {
    while (stack.length && stack[stack.length - 1].level >= t.level) stack.pop()
    if (stack.length) {
      const parent = stack[stack.length - 1]
      if (!childrenOf.has(parent.index)) childrenOf.set(parent.index, [])
      childrenOf.get(parent.index)!.push(i)
    }
    stack.push({ index: i, level: t.level })
  })
  return childrenOf
}

const DELAY_NOTES = [
  'Chậm do ảnh hưởng thời tiết mưa kéo dài',
  'Chậm do chờ vật tư nhập khẩu về công trường',
  'Chậm do điều chỉnh thiết kế sau xử lý xung đột BIM',
  'Chậm do huy động nhân lực chưa đạt kế hoạch',
  'Chậm tiến độ, đang bổ sung ca thi công để bù tiến độ',
]
const ONTIME_NOTES = ['Đạt kế hoạch đề ra', 'Đúng tiến độ, không phát sinh', '']

// Hạng mục LÁ (không có con): mô phỏng tiến độ thực tế theo đúng cơ chế cũ (dựa trên
// ELAPSED_DAYS thật của dự án, có random % chậm/sớm hợp lý cho hạng mục đã bắt đầu).
function buildLeafItem(t: ScheduleTemplate, index: number): ScheduleItem {
  const plannedStart = addDays(PROJECT_START, t.startDay)
  const plannedEnd = addDays(PROJECT_START, t.endDay)
  const hasStarted = ELAPSED_DAYS >= t.startDay

  const base = {
    id: `HM-${String(index + 1).padStart(3, '0')}`,
    wbsCode: t.wbsCode,
    level: t.level,
    isSummary: false as const,
    name: t.name,
    discipline: t.discipline,
    block: t.block,
    plannedStart,
    plannedEnd,
  }

  if (!hasStarted) {
    return {
      ...base,
      actualStart: null,
      actualEnd: null,
      percentComplete: 0,
      status: 'Chưa bắt đầu',
      delayDays: 0,
      note: '',
    }
  }

  const isDelayed = chance(rng, 0.32)
  const delayDays = isDelayed ? randInt(rng, 3, 15) : 0
  const actualStart = addDays(plannedStart, isDelayed ? randInt(rng, 1, 4) : randInt(rng, -2, 1))
  const effectiveEndDay = t.endDay + delayDays
  const finished = ELAPSED_DAYS >= effectiveEndDay

  let percentComplete: number
  let actualEnd: Date | null
  let status: ScheduleStatus

  if (finished) {
    percentComplete = 100
    actualEnd = addDays(PROJECT_START, effectiveEndDay)
    status = 'Hoàn thành'
  } else {
    const totalSpan = Math.max(1, effectiveEndDay - t.startDay)
    const elapsedSpan = ELAPSED_DAYS - t.startDay
    percentComplete = clamp(Math.round((elapsedSpan / totalSpan) * 100), 3, 97)
    actualEnd = null
    status = delayDays >= 3 ? 'Chậm tiến độ' : chance(rng, 0.12) ? 'Sớm tiến độ' : 'Đúng tiến độ'
  }

  const note = status === 'Chậm tiến độ' ? pick(rng, DELAY_NOTES) : pick(rng, ONTIME_NOTES)

  return {
    ...base,
    actualStart,
    actualEnd,
    percentComplete,
    status,
    delayDays: status === 'Chậm tiến độ' ? delayDays : 0,
    note,
  }
}

// Hạng mục TỔNG HỢP (có con, vd "4.2.1 Phần ngầm"): percentComplete/status/actualStart/actualEnd
// TÍNH GỘP từ chính các hạng mục con thật (không mô phỏng độc lập) - tránh tình huống vô lý như
// "cha đã Hoàn thành" trong khi "con vẫn Chưa bắt đầu". plannedStart/plannedEnd vẫn lấy trực tiếp
// từ file gốc (MS Project đã tự tính rollup này khi xuất file, không cần suy lại).
function buildSummaryItem(t: ScheduleTemplate, index: number, children: ScheduleItem[]): ScheduleItem {
  const plannedStart = addDays(PROJECT_START, t.startDay)
  const plannedEnd = addDays(PROJECT_START, t.endDay)

  const weight = (c: ScheduleItem) => Math.max(1, c.plannedEnd.getTime() - c.plannedStart.getTime())
  const totalWeight = children.reduce((s, c) => s + weight(c), 0)
  const percentComplete =
    totalWeight > 0
      ? Math.round(children.reduce((s, c) => s + c.percentComplete * weight(c), 0) / totalWeight)
      : 0

  const allDone = children.every((c) => c.status === 'Hoàn thành')
  const noneStarted = children.every((c) => c.status === 'Chưa bắt đầu')
  const anyDelayed = children.some((c) => c.status === 'Chậm tiến độ')
  let status: ScheduleStatus
  if (allDone) status = 'Hoàn thành'
  else if (noneStarted) status = 'Chưa bắt đầu'
  else if (anyDelayed) status = 'Chậm tiến độ'
  else status = 'Đúng tiến độ'

  const delayDays = children.reduce((m, c) => Math.max(m, c.delayDays), 0)

  const startedTimes = children.map((c) => c.actualStart?.getTime()).filter((x): x is number => x != null)
  const actualStart = startedTimes.length ? new Date(Math.min(...startedTimes)) : null

  const endTimes = children.map((c) => c.actualEnd?.getTime())
  const actualEnd = allDone && endTimes.every((x): x is number => x != null) ? new Date(Math.max(...(endTimes as number[]))) : null

  return {
    id: `HM-${String(index + 1).padStart(3, '0')}`,
    wbsCode: t.wbsCode,
    level: t.level,
    isSummary: true,
    name: t.name,
    discipline: t.discipline,
    block: t.block,
    plannedStart,
    plannedEnd,
    actualStart,
    actualEnd,
    percentComplete,
    status,
    delayDays,
    note: '',
  }
}

function buildAllItems(templates: ScheduleTemplate[]): ScheduleItem[] {
  const childrenOf = buildChildrenMap(templates)
  const built: ScheduleItem[] = new Array(templates.length)
  // Duyệt từ CUỐI mảng lên ĐẦU: nhờ đúng thứ tự pre-order của file gốc, mọi hạng mục con luôn có
  // index LỚN HƠN cha - duyệt ngược đảm bảo con luôn được dựng xong trước khi tính gộp lên cha.
  for (let i = templates.length - 1; i >= 0; i--) {
    const t = templates[i]
    const childIndices = childrenOf.get(i)
    built[i] = childIndices
      ? buildSummaryItem(t, i, childIndices.map((ci) => built[ci]))
      : buildLeafItem(t, i)
  }
  return built
}

export const scheduleItems: ScheduleItem[] = buildAllItems(TEMPLATES)

export const scheduleDayRange = {
  totalDays: Math.max(...TEMPLATES.map((t) => t.endDay)),
}
