// Nhãn tiếng Anh cho các GIÁ TRỊ DỮ LIỆU dạng liệt kê (Discipline, trạng thái tiến độ/xung đột,
// giai đoạn thi công, hệ MEP...) - các type này dùng chuỗi tiếng Việt làm GIÁ TRỊ GỐC xuyên suốt
// app (khoá object, so sánh điều kiện, filter...), xem src/types/index.ts. Không đổi giá trị gốc
// (sẽ vỡ toàn bộ logic đang so sánh/tra cứu theo đúng chuỗi tiếng Việt đó) - chỉ thêm 1 lớp DỊCH
// KHI HIỂN THỊ, tra theo `language` hiện tại từ useLanguage(). Thuật ngữ tiếng Anh dùng đúng quy
// ước ngành BIM/xây dựng quốc tế (vd "MEP", "RC" không dịch, "Structural" thay vì dịch sát nghĩa
// "Structure").
import type {
  AlertLevel,
  ClashSeverity,
  ClashStatus,
  Discipline,
  EquipmentSystem,
  FieldChangeStatus,
  ScheduleStatus,
} from '../types'
import type { ConstructionPhase } from '../ifc/constructionPhase'
import type { MepSystemCategory } from '../ifc/mepSystem'
import type { QuantityGroup, QuantityStatus } from '../data/quantities'
import type { Language } from './LanguageContext'

function tr<T extends string>(vi: T, map: Partial<Record<T, string>>, language: Language): string {
  return language === 'en' ? (map[vi] ?? vi) : vi
}

const DISCIPLINE_EN: Record<Discipline, string> = {
  'Kiến trúc': 'Architecture',
  'Kết cấu': 'Structural',
  MEP: 'MEP',
  'Hạ tầng': 'Infrastructure',
}
export const disciplineLabel = (d: Discipline, language: Language): string => tr(d, DISCIPLINE_EN, language)

const SCHEDULE_STATUS_EN: Record<ScheduleStatus, string> = {
  'Chưa bắt đầu': 'Not started',
  'Đúng tiến độ': 'On schedule',
  'Chậm tiến độ': 'Delayed',
  'Sớm tiến độ': 'Ahead of schedule',
  'Hoàn thành': 'Completed',
}
export const scheduleStatusLabel = (s: ScheduleStatus, language: Language): string => tr(s, SCHEDULE_STATUS_EN, language)

const CLASH_STATUS_EN: Record<ClashStatus, string> = {
  Mới: 'New',
  'Đang xử lý': 'In progress',
  'Đã xử lý': 'Resolved',
  'Bỏ qua': 'Dismissed',
}
export const clashStatusLabel = (s: ClashStatus, language: Language): string => tr(s, CLASH_STATUS_EN, language)

// Nhãn đầy đủ "Nhóm X - mức ảnh hưởng" dùng trong panel chi tiết xung đột (ClashDetailPanel/
// ClashInfoPanel) - khác với chữ cái đơn A/B/C hiển thị trong bảng (ClashTable), vốn đã trung lập
// ngôn ngữ nên không cần dịch.
const CLASH_SEVERITY_FULL_EN: Record<ClashSeverity, string> = {
  A: 'Group A - major impact',
  B: 'Group B - moderate impact',
  C: 'Group C - minor impact',
}
const CLASH_SEVERITY_FULL_VI: Record<ClashSeverity, string> = {
  A: 'Nhóm A - ảnh hưởng lớn',
  B: 'Nhóm B - trung bình',
  C: 'Nhóm C - nhỏ',
}
export const clashSeverityFullLabel = (s: ClashSeverity, language: Language): string =>
  language === 'en' ? CLASH_SEVERITY_FULL_EN[s] : CLASH_SEVERITY_FULL_VI[s]

const FIELD_CHANGE_STATUS_EN: Record<FieldChangeStatus, string> = {
  'Chờ cập nhật': 'Pending update',
  'Đã cập nhật': 'Updated',
}
export const fieldChangeStatusLabel = (s: FieldChangeStatus, language: Language): string =>
  tr(s, FIELD_CHANGE_STATUS_EN, language)

const ALERT_LEVEL_EN: Record<AlertLevel, string> = {
  'Nghiêm trọng': 'Critical',
  'Cảnh báo': 'Warning',
  'Thông tin': 'Info',
}
export const alertLevelLabel = (l: AlertLevel, language: Language): string => tr(l, ALERT_LEVEL_EN, language)

const QUANTITY_STATUS_EN: Record<QuantityStatus, string> = {
  Khớp: 'Matched',
  'Cần rà soát': 'Needs review',
  'Chênh lệch lớn': 'Major variance',
}
export const quantityStatusLabel = (s: QuantityStatus, language: Language): string => tr(s, QUANTITY_STATUS_EN, language)

const QUANTITY_GROUP_EN: Record<QuantityGroup, string> = {
  'Kết cấu - Bê tông': 'Structural - Concrete',
  'Kết cấu - Thép': 'Structural - Steel',
  'Kiến trúc': 'Architecture',
  'MEP - Điện': 'MEP - Electrical',
  'MEP - Cơ & Đường ống': 'MEP - Mechanical & Piping',
  'Hạ tầng': 'Infrastructure',
}
export const quantityGroupLabel = (g: QuantityGroup, language: Language): string => tr(g, QUANTITY_GROUP_EN, language)

const EQUIPMENT_SYSTEM_EN: Record<EquipmentSystem, string> = {
  PCCC: 'Fire protection',
  Điện: 'Electrical',
  'Cấp thoát nước': 'Water supply & drainage',
  HVAC: 'HVAC',
  'Hạ tầng': 'Infrastructure',
}
export const equipmentSystemLabel = (s: EquipmentSystem, language: Language): string => tr(s, EQUIPMENT_SYSTEM_EN, language)

const CONSTRUCTION_PHASE_EN: Record<ConstructionPhase, string> = {
  coc: 'Pile driving',
  mong: 'Foundation / pile cap',
  khung: 'Column & beam frame',
  san_mai: 'Slab / roof',
  bao_che: 'Envelope (wall/openings)',
  hoan_thien: 'Finishing',
  khac: 'Other',
}
export const constructionPhaseLabel = (p: ConstructionPhase, language: Language): string =>
  tr(p, CONSTRUCTION_PHASE_EN, language)

const MEP_SYSTEM_EN: Record<MepSystemCategory, string> = {
  cap_gio: 'Supply air / FCU-AHU',
  hoi_thai_gio: 'Return / exhaust air',
  nuoc_lanh: 'Chilled water & condenser',
  lo_hoi_nuoc_nong: 'Boiler & hot water',
  khi_nen: 'Compressed air',
  cap_thoat_nuoc: 'Water supply & drainage',
  dien_chieu_sang: 'Electrical & lighting',
  khac: 'Other / unclassified',
}
export const mepSystemLabel = (c: MepSystemCategory, language: Language): string => tr(c, MEP_SYSTEM_EN, language)

// Đơn vị tính (BOQ) - chỉ cần dịch các đơn vị dùng TỪ tiếng Việt ("cái"/"bộ"/"trọn gói"); các ký
// hiệu SI/kỹ thuật (m³, m², kg, m, tấn/m²...) đã trung lập ngôn ngữ, giữ nguyên qua tr()/unitLabel
// (không có trong map bên dưới thì trả lại y nguyên).
const UNIT_EN: Record<string, string> = {
  cái: 'pcs',
  bộ: 'set',
  'trọn gói': 'lump sum',
}
export const unitLabel = (unit: string, language: Language): string =>
  language === 'en' ? (UNIT_EN[unit] ?? unit) : unit

const PROCUREMENT_STATUS_EN: Record<string, string> = {
  'Đã phát hành': 'Released',
  'Đang chuẩn bị': 'In preparation',
}
export const procurementStatusLabel = (s: string, language: Language): string =>
  language === 'en' ? (PROCUREMENT_STATUS_EN[s] ?? s) : s
