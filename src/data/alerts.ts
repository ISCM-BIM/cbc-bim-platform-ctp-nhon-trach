import type { AlertItem } from '../types'
import { clashes } from './clashes'
import { scheduleItems } from './schedule'
import { fieldChanges } from './fieldChanges'
import { CURRENT_DATE } from './constants'
import { BIM_TEAM, SITE_TEAM } from './people'

function buildAlerts(): AlertItem[] {
  const alerts: AlertItem[] = []

  const overdueA = clashes
    .filter(
      (c) =>
        (c.status === 'Mới' || c.status === 'Đang xử lý') &&
        c.severity === 'A' &&
        c.dueDate < CURRENT_DATE,
    )
    .sort((a, b) => b.estimatedCost - a.estimatedCost)

  overdueA.slice(0, 2).forEach((c) => {
    alerts.push({
      id: `CB-${c.id}`,
      level: 'Nghiêm trọng',
      title: `Xung đột nhóm A quá hạn xử lý (Block ${c.block}): ${c.description}`,
      time: c.dueDate,
      assignee: c.assignee,
    })
  })

  // Chỉ cảnh báo hạng mục LÁ (isSummary = false) - hạng mục tổng hợp (vd "4.2.1 Phần ngầm") chỉ
  // là con số GỘP LẠI từ chính các hạng mục lá bên dưới, báo cả 2 tầng sẽ trùng lặp thông tin.
  const delayedItems = scheduleItems
    .filter((s) => !s.isSummary && s.status === 'Chậm tiến độ')
    .sort((a, b) => b.delayDays - a.delayDays)

  delayedItems.slice(0, 2).forEach((s) => {
    alerts.push({
      id: `CB-${s.id}`,
      level: 'Cảnh báo',
      title: `Hạng mục chậm tiến độ ${s.delayDays} ngày: ${s.name}`,
      time: s.plannedEnd,
      assignee: SITE_TEAM[0].name,
    })
  })

  const pendingUpdates = fieldChanges.filter((f) => f.modelStatus === 'Chờ cập nhật')
  if (pendingUpdates.length > 0) {
    alerts.push({
      id: 'CB-TD',
      level: 'Thông tin',
      title: `${pendingUpdates.length} thay đổi hiện trường đang chờ cập nhật vào mô hình`,
      time: CURRENT_DATE,
      assignee: BIM_TEAM[1].name,
    })
  }

  const newClashesCount = clashes.filter((c) => c.status === 'Mới').length
  if (newClashesCount > 0) {
    alerts.push({
      id: 'CB-XD-MOI',
      level: 'Thông tin',
      title: `${newClashesCount} xung đột mới phát hiện trong tuần cần phân công xử lý`,
      time: CURRENT_DATE,
      assignee: BIM_TEAM[0].name,
    })
  }

  return alerts.slice(0, 5)
}

export const alerts: AlertItem[] = buildAlerts()
