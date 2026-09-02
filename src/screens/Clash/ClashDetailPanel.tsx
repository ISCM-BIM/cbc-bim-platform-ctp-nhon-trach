import { X, MapPin, Layers3, Calendar, User, CircleDollarSign } from 'lucide-react'
import type { Clash, ClashStatus } from '../../types'
import { Badge } from '../../components/common/Badge'
import { clashSeverityTone, clashStatusTone } from '../../utils/tone'
import { formatDate, formatVNDShort } from '../../utils/format'
import { useRole } from '../../context/RoleContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { clashSeverityFullLabel, clashStatusLabel, disciplineLabel } from '../../i18n/enumLabels'

const STATUS_FLOW: ClashStatus[] = ['Mới', 'Đang xử lý', 'Đã xử lý', 'Bỏ qua']

interface ClashDetailPanelProps {
  clash: Clash
  onClose: () => void
  onChangeStatus: (id: string, status: ClashStatus) => void
}

export function ClashDetailPanel({ clash, onClose, onChangeStatus }: ClashDetailPanelProps) {
  const { permissions } = useRole()
  const { language, tr } = useLanguage()

  return (
    <div className="panel flex h-full w-96 shrink-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant">{clash.id}</span>
          <Badge tone={clashSeverityTone(clash.severity)}>{clashSeverityFullLabel(clash.severity, language)}</Badge>
        </div>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      <div className="mb-3 flex h-32 items-center justify-center border border-outline-variant bg-surface-container-lowest text-[11px] text-outline">
        {tr('Ảnh chụp vị trí xung đột (minh hoạ)', 'Clash location photo (illustrative)')}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-on-surface">{clash.description}</p>

      <div className="space-y-1.5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <Layers3 size={13} className="text-on-surface-variant" />
          {disciplineLabel(clash.disciplineA, language)} – {disciplineLabel(clash.disciplineB, language)}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-on-surface-variant" />
          Block {clash.block} · {tr('cao độ', 'elevation')} {clash.elevation}
        </div>
        <div className="flex items-center gap-1.5">
          <CircleDollarSign size={13} className="text-on-surface-variant" />
          {tr('Chi phí ước tính', 'Estimated cost')}: <span className="font-medium text-on-surface">{formatVNDShort(clash.estimatedCost, language)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-on-surface-variant" />
          {tr('Phụ trách', 'Assignee')}: {clash.assignee}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-on-surface-variant" />
          {tr('Hạn xử lý', 'Due date')}: {formatDate(clash.dueDate)}
        </div>
      </div>

      <div className="mt-4 border-t border-outline-variant pt-3">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">{tr('Trạng thái', 'Status')}</p>
        {permissions.canEditClashStatus ? (
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeStatus(clash.id, s)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  clash.status === s
                    ? 'bg-brand text-white'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {clashStatusLabel(s, language)}
              </button>
            ))}
          </div>
        ) : (
          <Badge tone={clashStatusTone(clash.status)}>{clashStatusLabel(clash.status, language)}</Badge>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto border-t border-outline-variant pt-3">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">{tr('Lịch sử trao đổi', 'Comment history')}</p>
        <div className="space-y-2.5">
          {clash.comments.map((c, i) => (
            <div key={i} className="border border-outline-variant bg-surface-container-lowest p-2.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">{c.author}</span>
                <span className="text-[10px] text-on-surface-variant">{formatDate(c.date)}</span>
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant">{c.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
