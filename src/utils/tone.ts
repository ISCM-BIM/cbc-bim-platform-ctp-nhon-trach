import type { BadgeTone } from '../components/common/Badge'
import type { AlertLevel, ClashStatus, FieldChangeStatus, ScheduleStatus } from '../types'

export function alertLevelTone(level: AlertLevel): BadgeTone {
  if (level === 'Nghiêm trọng') return 'danger'
  if (level === 'Cảnh báo') return 'warning'
  return 'info'
}

export function clashStatusTone(status: ClashStatus): BadgeTone {
  if (status === 'Mới') return 'warning'
  if (status === 'Đang xử lý') return 'info'
  if (status === 'Đã xử lý') return 'success'
  return 'neutral'
}

export function clashSeverityTone(severity: 'A' | 'B' | 'C'): BadgeTone {
  if (severity === 'A') return 'danger'
  if (severity === 'B') return 'warning'
  return 'neutral'
}

export function scheduleStatusTone(status: ScheduleStatus): BadgeTone {
  if (status === 'Chậm tiến độ') return 'danger'
  if (status === 'Sớm tiến độ') return 'info'
  if (status === 'Đúng tiến độ') return 'success'
  if (status === 'Hoàn thành') return 'success'
  return 'neutral'
}

export function fieldChangeStatusTone(status: FieldChangeStatus): BadgeTone {
  return status === 'Đã cập nhật' ? 'success' : 'warning'
}
