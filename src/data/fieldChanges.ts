import type { FieldChange, FieldChangeStatus } from '../types'
import { PROJECT_START } from './constants'
import { addDays } from '../utils/random'

// Ví dụ MINH HOẠ tính năng "Hoàn công & Thay đổi hiện trường" (theo yêu cầu người dùng - giữ
// tính năng có dữ liệu thay vì để trống). Dự án còn ở giai đoạn tiền hợp đồng (chưa có LOA, xem
// constants.ts) nên đây KHÔNG PHẢI log thay đổi hiện trường thật (chưa khởi công thì chưa thể có
// thay đổi PHÁT SINH TỪ HIỆN TRƯỜNG) - là các tình huống điển hình cho đúng loại công trình/hạng
// mục thật của RBF6-7 (khung thép, mái/vách tôn, trạm điện 02, hạ tầng), đặt trong đúng khung
// thời gian thật của giai đoạn thiết kế/shop drawing (mục "3.2"/"2.1" trong schedule.ts) - không
// neo theo CURRENT_DATE (dự án chưa khởi công nên mọi mốc "hôm nay" đều nằm trước ngày các thay
// đổi này có thể xảy ra thật).
const ENTRIES: Array<{
  dayOffset: number
  block: FieldChange['block']
  discipline: FieldChange['discipline']
  description: string
  reason: string
  reporter: string
  modelStatus: FieldChangeStatus
  quantityImpact: string
}> = [
  {
    dayOffset: 25,
    block: 'A',
    discipline: 'Kết cấu',
    description: 'Điều chỉnh cao độ đáy móng khu vực Zone 2 - RBF6 theo kết quả khảo sát địa chất bổ sung',
    reason: 'Sai lệch khảo sát địa chất',
    reporter: 'Bùi Văn Sơn',
    modelStatus: 'Đã cập nhật',
    quantityImpact: '+3% khối lượng đào đất Zone 2',
  },
  {
    dayOffset: 31,
    block: 'A',
    discipline: 'Kiến trúc',
    description: 'Đổi chiều dày tôn vách bao che RBF6 từ AZ150 0,48mm sang 0,53mm theo yêu cầu chống ăn mòn khu vực gần biển',
    reason: 'Yêu cầu chủ đầu tư (CTP Nhơn Trạch)',
    reporter: 'Vũ Đức Thắng',
    modelStatus: 'Đã cập nhật',
    quantityImpact: '+38 triệu đồng vật tư tôn vách',
  },
  {
    dayOffset: 44,
    block: 'C',
    discipline: 'MEP',
    description: 'Điều chỉnh vị trí Trạm điện 02 lùi vào 1,2m để đảm bảo hành lang an toàn PCCC theo quy chuẩn QCVN 06:2022',
    reason: 'Thay đổi quy chuẩn PCCC',
    reporter: 'Đặng Minh Khôi',
    modelStatus: 'Đã cập nhật',
    quantityImpact: 'Không thay đổi khối lượng',
  },
  {
    dayOffset: 52,
    block: 'A',
    discipline: 'Kết cấu',
    description: 'Bổ sung cọc dẫn tại 3 vị trí góc RBF6 (Zone 1, Zone 4) do điều kiện địa chất yếu cục bộ',
    reason: 'Điều kiện thực tế khảo sát địa chất',
    reporter: 'Phạm Quốc Bảo',
    modelStatus: 'Chờ cập nhật',
    quantityImpact: '+3 cọc PHC-A400',
  },
  {
    dayOffset: 58,
    block: 'B',
    discipline: 'Hạ tầng',
    description: 'Điều chỉnh hướng tuyến thoát nước mưa khu vực giáp Trạm XLNT theo cao độ san nền thực tế',
    reason: 'Điều kiện thực tế hiện trường',
    reporter: 'Trịnh Văn Đạt',
    modelStatus: 'Chờ cập nhật',
    quantityImpact: '+12 md tuyến ống D300',
  },
]

export const fieldChanges: FieldChange[] = ENTRIES.map((e, i) => ({
  id: `TD-${String(i + 1).padStart(3, '0')}`,
  date: addDays(PROJECT_START, e.dayOffset),
  block: e.block,
  discipline: e.discipline,
  description: e.description,
  reason: e.reason,
  reporter: e.reporter,
  modelStatus: e.modelStatus,
  quantityImpact: e.quantityImpact,
})).sort((a, b) => a.date.getTime() - b.date.getTime())
