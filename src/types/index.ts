export type BlockId = 'A' | 'B' | 'C' | 'D'

export type Discipline = 'Kiến trúc' | 'Kết cấu' | 'MEP' | 'Hạ tầng'

export type UserRole = 'contractor' | 'investor' | 'bim_manager'

export type ScreenId =
  | 'dashboard'
  | 'model3d'
  | 'autodesk'
  | 'schedule'
  | 'quantity'
  | 'clash'
  | 'asbuilt'
  | 'assets'

export type AppView = 'intro' | ScreenId

export interface RolePermissions {
  visibleScreens: ScreenId[]
  canSeeClashDetail: boolean
  canEditClashStatus: boolean
}

export interface BlockInfo {
  id: BlockId
  name: string
  areaM2: number
}

// ----- Tiến độ thi công -----

export type ScheduleStatus =
  | 'Chưa bắt đầu'
  | 'Đúng tiến độ'
  | 'Chậm tiến độ'
  | 'Sớm tiến độ'
  | 'Hoàn thành'

// wbsCode/level phản ánh đúng cấu trúc WBS lồng nhau thật của file MS Project gốc (vd
// "4.2.1.1.1.1"), không phải khái niệm tự đặt - level = số đoạn phân tách bởi dấu chấm (hạng mục
// gốc "TIẾN ĐỘ THI CÔNG" không có wbsCode, level 0). isSummary = true cho các dòng "cha" có hạng
// mục con bên dưới (rollup) - percentComplete/status/actualStart/actualEnd của các dòng này được
// TÍNH GỘP từ hạng mục con thật, không mô phỏng độc lập (xem buildSummaryItem trong schedule.ts).
export interface ScheduleItem {
  id: string
  wbsCode: string
  level: number
  isSummary: boolean
  name: string
  discipline: Discipline
  block: BlockId | 'Toàn dự án'
  plannedStart: Date
  plannedEnd: Date
  actualStart: Date | null
  actualEnd: Date | null
  percentComplete: number
  status: ScheduleStatus
  delayDays: number
  note: string
}

// ----- Xung đột (Clash) -----

export type ClashSeverity = 'A' | 'B' | 'C'

export type ClashStatus = 'Mới' | 'Đang xử lý' | 'Đã xử lý' | 'Bỏ qua'

export interface ClashComment {
  author: string
  date: Date
  message: string
}

export interface Clash {
  id: string
  description: string
  disciplineA: Discipline
  disciplineB: Discipline
  block: BlockId
  elevation: string
  severity: ClashSeverity
  estimatedCost: number
  status: ClashStatus
  assignee: string
  detectedDate: Date
  dueDate: Date
  resolvedDate: Date | null
  comments: ClashComment[]
  position: { x: number; y: number; z: number }
}

// ----- Thiết bị / Tài sản -----

export type EquipmentSystem = 'PCCC' | 'Điện' | 'Cấp thoát nước' | 'HVAC' | 'Hạ tầng'

export interface MaintenanceTask {
  date: Date
  task: string
}

export interface Equipment {
  id: string
  name: string
  system: EquipmentSystem
  block: BlockId | 'Toàn dự án'
  location: string
  manufacturer: string
  model: string
  capacity: string
  installDate: Date
  warrantyUntil: Date
  maintenanceCycleMonths: number
  documents: string[]
  upcomingMaintenance: MaintenanceTask[]
}

// ----- Hoàn công & Thay đổi hiện trường -----

export type FieldChangeStatus = 'Chờ cập nhật' | 'Đã cập nhật'

export interface FieldChange {
  id: string
  date: Date
  block: BlockId
  discipline: Discipline
  description: string
  reason: string
  reporter: string
  modelStatus: FieldChangeStatus
  quantityImpact: string
}

export interface ModelVersion {
  version: string
  date: Date
  changesIntegrated: number
  author: string
  note: string
}

// ----- Cảnh báo (Dashboard) -----

export type AlertLevel = 'Nghiêm trọng' | 'Cảnh báo' | 'Thông tin'

export interface AlertItem {
  id: string
  level: AlertLevel
  title: string
  time: Date
  assignee: string
}

// ----- Thông số hạng mục công trình -----
// Trước đây là "TenantInfo" (dữ liệu cho thuê) - dự án thật là nhà máy tự vận hành, không
// cho thuê, nên đổi thành thông số kỹ thuật cơ bản từng hạng mục (diện tích, số tầng, tải
// trọng, chiều cao thông thuỷ...) theo đúng yêu cầu làm rõ thông tin của đối tác.
export interface AssetItemInfo {
  id: string
  name: string
  block: BlockId
  areaM2: number
  storeys: number
  floorLoadTonPerM2?: number
  clearHeightM?: number
  note?: string
}
