import type { BlockInfo, Discipline } from '../types'

// Dự án thật. Chủ đầu tư là CÔNG TY TNHH CTP NHƠN TRẠCH (CTP Nhon Trach Limited Liability
// Company) - công ty dự án thuộc tập đoàn bất động sản công nghiệp CTP (thương hiệu "ctpark",
// gốc Séc, đã triển khai nhiều khu công nghiệp tại Việt Nam). Tên/địa chỉ lấy đúng nguyên văn
// khung tên (title block) của hồ sơ "CTP_NT_VINATEX_A_TECHNICAL DESIGN_26.07.18.pdf" và trang bìa
// "BOQ CTP -15.08.26 PHASE 2 (VALUE).xlsx" (tab "Sum P2") - dự án nằm trong Khu công nghiệp Dệt
// May Nhơn Trạch (tên khu vẫn giữ "Dệt May" dù nay do CTP phát triển - tên quy hoạch gốc), tỉnh
// Đồng Nai (nay là "TP. Đồng Nai" theo địa giới hành chính mới sau sáp nhập). CBC là nhà thầu
// Thiết kế & Thi công (Design & Build) - khung hợp tác CBC × ISCM-UEH giữ nguyên như các dự án
// khác của nền tảng này, chỉ đổi CHỦ ĐẦU TƯ/công trình.
//
// Nền tảng này chỉ thể hiện GÓI THẦU GIAI ĐOẠN 2 ("Design and Build for Main Contract Works
// Package") - phạm vi: Nhà xưởng RBF6-7 (nhà xưởng xây sẵn 4 tầng, thương hiệu cho thuê nội bộ
// "ctspace") + các hạng mục phụ trợ (khu phụ trợ & bể nước, trạm xử lý nước thải, bãi đậu xe 02,
// trạm điện 02 + bệ đỡ, hàng rào/cổng/nhà bảo vệ 3, hạ tầng kỹ thuật). KHÔNG bao gồm RBF1-5 hay
// các hạng mục Giai đoạn 1 khác của ctpark Nhơn Trạch (những hạng mục đó đã/đang triển khai theo
// gói thầu khác, ngoài phạm vi dữ liệu được cung cấp cho nền tảng này).
export const PROJECT_NAME = 'Nhà xưởng xây sẵn RBF6-7 – ctpark Nhơn Trạch'
export const PROJECT_ADDRESS =
  'Lô B-6, đường Võ Văn Tần, Khu công nghiệp Dệt May Nhơn Trạch, phường Nhơn Trạch, TP. Đồng Nai'
export const PLATFORM_TITLE = 'DỰ ÁN CTPARK NHƠN TRẠCH — GIAI ĐOẠN 2 (NHÀ XƯỞNG RBF6-7)'
// Tên hiển thị ngắn gọn cho 3 vai trò trên khung tên dự án (ProjectInfoPanel...) - đúng tên pháp
// nhân trong khung tên hồ sơ thiết kế, không viết tắt thêm.
export const PROJECT_INVESTOR = 'Công ty TNHH CTP Nhơn Trạch'

// Tổng giá trị gói thầu Giai đoạn 2, TRƯỚC VAT - khớp đúng dòng "TOTAL AMOUNT (EXCLUDING VAT)"
// trong tab "Sum P2" của BOQ (tổng 8 Bill: 15.017.755.000 + 374.885.000 + 700.000.000 +
// 225.475.347.000 + 12.973.546.000 + 22.285.175.000 + 121.213.587.000 + 380.000.000). Hồ sơ BOQ
// này KHÔNG có dòng VAT/tổng sau VAT (khác bộ hồ sơ dự án trước) nên không dựng thêm số liệu đó -
// xem thêm chi tiết từng Bill trong quantities.ts.
export const PROJECT_VALUE = 398_420_000_000

// Bảng cân bằng sử dụng đất & Bảng thống kê công trình - "CTP_NT_VINATEX_A_TECHNICAL
// DESIGN_26.07.18.pdf" (trang Tổng mặt bằng, mục "QUY MÔ DIỆN TÍCH"). Đây là số liệu cho TOÀN BỘ
// khu đất ctpark Nhơn Trạch (không chỉ riêng phạm vi Giai đoạn 2) - RBF1-7 + Club house + 2 bãi
// xe đều tính vào "Công trình chính". Đã đối chiếu: A+B+C+D = 66.120,37+989,10+23.122,21+25.096,32
// = 115.328,00 (khớp đúng dòng tổng), và tổng footprint/GFA từng công trình con cộng lại cũng
// khớp đúng 2 dòng tổng của mục A - không phải số tự suy diễn.
export const TOTAL_LAND_AREA_M2 = 115_328 // Tổng diện tích khu đất ctpark Nhơn Trạch
export const TOTAL_FLOOR_AREA_M2 = 90_682.77 // Tổng sàn xây dựng (GFA) - mục A, toàn bộ công trình chính
export const TOTAL_BUILDING_FOOTPRINT_M2 = 66_120.37 // Diện tích xây dựng mục A (mật độ XD 57,33%, trần cho phép ≤70% theo QĐ 165/QĐ-UBND 17/1/2022)
export const FLOOR_AREA_RATIO = 0.79 // Hệ số sử dụng đất (FAR) = GFA/đất = 90.682,77/115.328,00
// Giữ tên biến cũ (nhiều màn hình đang import) - trỏ về diện tích sàn xây dựng, số liệu thật.
export const TOTAL_AREA_M2 = TOTAL_FLOOR_AREA_M2

// Mốc thời gian dự án thật - "CTP_Master Cons Schedule_Phase 2.pdf/.mpp" (script trích ngày
// thật từ toàn bộ 232 dòng công tác trong file, xem schedule.ts). Mốc ngày 0 của TOÀN BỘ
// startDay/endDay trong schedule.ts là ngày LOA (Letter of Acceptance - thư thông báo trúng
// thầu), KHÔNG PHẢI ngày khởi công (Lễ khởi công/Groundbreaking là 01/11/2026, xem mốc "1.4"
// trong schedule.ts - 7 ngày sau LOA). PROJECT_END là ngày hoàn tất mốc cuối cùng của file
// (8.1 Lấy sổ hồng).
export const PROJECT_START = new Date(2026, 9, 25) // LOA - 25/10/2026
export const PROJECT_END = new Date(2028, 2, 14) // Lấy sổ hồng - 14/03/2028
// "349 d" - đúng số ngày MS Project báo cho hạng mục "4 CÔNG TÁC XÂY DỰNG / CONSTRUCTION"
// (03/11/2026 → 31/10/2027, bao trùm toàn bộ RBF6+RBF7) - dùng trực tiếp số MS Project tự báo
// (đơn vị "ngày làm việc" theo lịch dự án, không phải hiệu số ngày dương lịch thô) để khớp đúng
// con số sẽ hiện trên UI (thanh trượt 4D ở Mô hình 3D) với con số đọc được khi mở file gốc.
export const TOTAL_CONSTRUCTION_DAYS = 349
// Thời điểm "hiện tại" trong nền tảng = ngày thực tế phiên làm việc này (2026-08-24) - TRƯỚC cả
// ngày LOA (25/10/2026) khoảng 2 tháng, tức dự án còn đang ở giai đoạn chào thầu/thương thảo,
// CHƯA ký hợp đồng. Giữ đúng nguyên tắc không dựng kịch bản "đã triển khai" khi thực tế chưa có
// gì bắt đầu: mọi % tiến độ dưới đây = 0, ELAPSED_DAYS âm khiến schedule.ts tự động không có
// hạng mục nào hasStarted - xem buildLeafItem(). Cũng vì lý do này, các màn hình mô tả TRẠNG THÁI
// THI CÔNG THẬT (Kiểm tra xung đột, Hoàn công, Thiết bị & vận hành, Hình ảnh hiện trường) để
// TRỐNG thay vì dựng dữ liệu giả - xem ghi chú trong từng file data tương ứng.
export const CURRENT_DATE = new Date(2026, 7, 24)

export const TOTAL_PROJECT_DAYS = Math.round(
  (PROJECT_END.getTime() - PROJECT_START.getTime()) / 86400000,
)
export const ELAPSED_DAYS = Math.round(
  (CURRENT_DATE.getTime() - PROJECT_START.getTime()) / 86400000,
)
export const REMAINING_DAYS = TOTAL_PROJECT_DAYS - ELAPSED_DAYS
export const CURRENT_MONTH_INDEX = Math.min(
  Math.ceil(1 + TOTAL_CONSTRUCTION_DAYS / 30.44),
  Math.max(
    1,
    (CURRENT_DATE.getFullYear() - PROJECT_START.getFullYear()) * 12 +
      (CURRENT_DATE.getMonth() - PROJECT_START.getMonth()) +
      1,
  ),
)

// "Block" giữ nguyên làm đơn vị nhóm hạng mục dùng xuyên suốt app (biểu đồ, bộ lọc, tài sản...),
// nay ứng với đúng 4 nhóm phạm vi thật của gói thầu Giai đoạn 2 (xem Bill 04/05/06 trong BOQ và
// mục 4.2-4.10 trong tiến độ) - KHÔNG còn 4 block kho xưởng hư cấu đối xứng như bản demo gốc.
// areaM2 của B/C lấy tổng diện tích các hạng mục thành phần THẬT (xem constants ở trên); C có 1
// phần nhỏ (diện tích trạm điện) suy ra từ bảng thống kê công trình bị xáo trộn thứ tự cột khi
// trích xuất PDF - độ lệch nếu có chỉ ảnh hưởng vài chục m² trên tổng ~600m², không đáng kể.
export const BLOCKS: BlockInfo[] = [
  { id: 'A', name: 'Nhà xưởng chính RBF6-7', areaM2: 43_170.1 },
  { id: 'B', name: 'Hạ tầng kỹ thuật (đường, thoát nước, cây xanh)', areaM2: 48_218.53 },
  { id: 'C', name: 'Công trình phụ trợ (bể nước, XLNT, trạm điện)', areaM2: 718.85 },
  { id: 'D', name: 'Bãi đậu xe, hàng rào & nhà bảo vệ', areaM2: 1_822.75 },
]
export const BLOCK_IDS = BLOCKS.map((b) => b.id)

export const DISCIPLINES: Discipline[] = ['Kiến trúc', 'Kết cấu', 'MEP', 'Hạ tầng']

// Màu bộ môn - khớp token --color-discipline-* trong index.css (đã hiệu chỉnh để đọc được
// trên nền sáng, xem ghi chú trong index.css). Kết cấu dùng thẳng Deep Navy của brand CBC.
// Bảng màu thương hiệu CBC (Deep Navy/Structural Red/Sky Accent...) là token của NỀN TẢNG, không
// đổi theo dự án - giữ nguyên theo đúng "DESIGN for CBC.md".
export const DISCIPLINE_COLORS: Record<Discipline, string> = {
  'Kiến trúc': '#5c6570',
  'Kết cấu': '#06477c',
  MEP: '#0f7ea8',
  'Hạ tầng': '#4b7a63',
}

// Bảng màu định danh (categorical) cho biểu đồ nhiều nhóm - đã kiểm tra độ tương phản trên
// nền trắng/xám nhạt của app. 2 màu đầu bám theo brand CBC (Deep Navy, Structural Red).
export const CHART_PALETTE = ['#06477c', '#ed1c24', '#4ac4f3', '#c98500', '#4b7a63', '#8a5b9a']

// Màu thương hiệu CBC - Structural Red, dùng cho nút chính/tiêu đề nhấn/chỉ báo active.
export const BRAND_COLOR = '#ed1c24'
export const BRAND_GLOW = 'rgba(237, 28, 36, 0.35)'
// Sky Accent - màu dữ liệu kỹ thuật, dùng tiết chế, không dùng cho brand/nút bấm
export const TECHNICAL_COLOR = '#4ac4f3'

// Đã hiệu chỉnh để đủ tương phản khi dùng làm màu chữ/đường biểu đồ trên nền trắng.
export const STATUS_COLORS = {
  success: '#146c2e',
  successDim: '#0e5323',
  warning: '#b45309',
  danger: '#ba1a1a',
  info: '#0f6fb0',
  neutral: '#59636e',
}

// Tiến độ vật lý tại thời điểm hiện tại - dự án CHƯA ký hợp đồng (xem CURRENT_DATE ở trên) nên
// tiến độ vật lý đúng thực tế là 0% ở mọi hạng mục.
export const BLOCK_PROGRESS: Record<string, number> = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
}

export const OVERALL_PLANNED_PROGRESS = 0
export const OVERALL_ACTUAL_PROGRESS = 0
