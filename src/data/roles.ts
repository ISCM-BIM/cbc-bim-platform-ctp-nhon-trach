import type { RolePermissions, ScreenId, UserRole } from '../types'

export const ALL_SCREENS: ScreenId[] = [
  'dashboard',
  'model3d',
  'autodesk',
  'schedule',
  'quantity',
  'clash',
  'asbuilt',
  'assets',
]

export const ROLE_LABELS: Record<UserRole, string> = {
  contractor: 'Ban Giám đốc nhà thầu',
  investor: 'Chủ đầu tư',
  bim_manager: 'Quản lý BIM',
}

export const ROLE_ORDER: UserRole[] = ['contractor', 'investor', 'bim_manager']

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  contractor: {
    visibleScreens: ALL_SCREENS,
    canSeeClashDetail: true,
    canEditClashStatus: false,
  },
  investor: {
    visibleScreens: ['dashboard', 'model3d', 'schedule', 'assets'],
    canSeeClashDetail: false,
    canEditClashStatus: false,
  },
  bim_manager: {
    visibleScreens: ALL_SCREENS,
    canSeeClashDetail: true,
    canEditClashStatus: true,
  },
}

export const SCREEN_LABELS: Record<ScreenId, string> = {
  dashboard: 'Tổng quan',
  model3d: 'Mô hình 3D',
  autodesk: 'Mô hình Autodesk Viewer',
  schedule: 'Tiến độ thi công',
  quantity: 'Khối lượng & Chi phí',
  clash: 'Kiểm tra xung đột',
  asbuilt: 'Hoàn công & Thay đổi',
  assets: 'Tài sản & Vận hành',
}
