import { X, MapPin, Layers3, Calendar, User, CircleDollarSign } from 'lucide-react'
import type { Clash } from '../../types'
import { Badge } from '../../components/common/Badge'
import { clashSeverityTone, clashStatusTone } from '../../utils/tone'
import { formatDate, formatVNDShort } from '../../utils/format'

interface ClashInfoPanelProps {
  clash: Clash
  onClose: () => void
}

const SEVERITY_LABEL: Record<string, string> = {
  A: 'Nhóm A - ảnh hưởng lớn',
  B: 'Nhóm B - trung bình',
  C: 'Nhóm C - nhỏ',
}

export function ClashInfoPanel({ clash, onClose }: ClashInfoPanelProps) {
  return (
    <div className="panel-strong absolute right-4 top-4 w-80 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-on-surface-variant">{clash.id}</span>
          <Badge tone={clashSeverityTone(clash.severity)}>{SEVERITY_LABEL[clash.severity]}</Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-3 flex h-28 items-center justify-center border border-outline-variant bg-surface-container-lowest text-[11px] text-outline">
        Ảnh chụp vị trí xung đột (minh hoạ)
      </div>

      <p className="mb-3 text-sm leading-relaxed text-on-surface">{clash.description}</p>

      <div className="space-y-1.5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <Layers3 size={13} className="text-on-surface-variant" />
          {clash.disciplineA} – {clash.disciplineB}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-on-surface-variant" />
          Block {clash.block} · cao độ {clash.elevation}
        </div>
        <div className="flex items-center gap-1.5">
          <CircleDollarSign size={13} className="text-on-surface-variant" />
          Chi phí ước tính: <span className="font-medium text-on-surface">{formatVNDShort(clash.estimatedCost)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-on-surface-variant" />
          Phụ trách: {clash.assignee}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-on-surface-variant" />
          Hạn xử lý: {formatDate(clash.dueDate)}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3">
        <span className="text-xs text-on-surface-variant">Trạng thái</span>
        <Badge tone={clashStatusTone(clash.status)}>{clash.status}</Badge>
      </div>
    </div>
  )
}
