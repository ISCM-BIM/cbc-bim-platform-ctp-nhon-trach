import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { alerts } from '../../data/alerts'
import { Badge } from '../../components/common/Badge'
import { alertLevelTone } from '../../utils/tone'
import { formatDate } from '../../utils/format'
import { useRole } from '../../context/RoleContext'
import type { AlertLevel } from '../../types'

const LEVEL_ICON: Record<AlertLevel, typeof AlertTriangle> = {
  'Nghiêm trọng': AlertTriangle,
  'Cảnh báo': AlertCircle,
  'Thông tin': Info,
}

export function AlertsPanel() {
  const { permissions } = useRole()
  const visibleAlerts = permissions.canSeeClashDetail
    ? alerts
    : alerts.filter((a) => !a.id.includes('XD'))

  return (
    <div className="flex h-full flex-col panel p-4">
      <p className="mb-3 text-sm font-semibold text-on-surface">Cảnh báo cần xử lý</p>
      {visibleAlerts.length === 0 ? (
        <p className="text-sm text-on-surface-variant">Không có cảnh báo nào.</p>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto">
          {visibleAlerts.map((a) => {
            const Icon = LEVEL_ICON[a.level]
            return (
              <div key={a.id} className="border border-outline-variant bg-surface-container-lowest p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Badge tone={alertLevelTone(a.level)}>
                    <Icon size={12} />
                    {a.level}
                  </Badge>
                  <span className="shrink-0 text-[11px] text-on-surface-variant">{formatDate(a.time)}</span>
                </div>
                <p className="text-xs leading-relaxed text-on-surface-variant">{a.title}</p>
                <p className="mt-1.5 text-[11px] text-on-surface-variant">Phụ trách: {a.assignee}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
