import { X, MapPin, Layers3, Calendar, User, CircleDollarSign } from 'lucide-react'
import type { Clash, ClashStatus } from '../../types'
import { Badge } from '../../components/common/Badge'
import { clashSeverityTone, clashStatusTone } from '../../utils/tone'
import { formatDate, formatVNDShort } from '../../utils/format'
import { useRole } from '../../context/RoleContext'

const SEVERITY_LABEL: Record<string, string> = {
  A: 'Nhóm A - ảnh hưởng lớn',
  B: 'Nhóm B - trung bình',
  C: 'Nhóm C - nhỏ',
}

const STATUS_FLOW: ClashStatus[] = ['Mới', 'Đang xử lý', 'Đã xử lý', 'Bỏ qua']

interface ClashDetailPanelProps {
  clash: Clash
  onClose: () => void
  onChangeStatus: (id: string, status: ClashStatus) => void
}

export function ClashDetailPanel({ clash, onClose, onChangeStatus }: ClashDetailPanelProps) {
  const { permissions } = useRole()

  return (
    <div className="panel flex h-full w-96 shrink-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant">{clash.id}</span>
          <Badge tone={clashSeverityTone(clash.severity)}>{SEVERITY_LABEL[clash.severity]}</Badge>
        </div>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      <div className="mb-3 flex h-32 items-center justify-center border border-outline-variant bg-surface-container-lowest text-[11px] text-outline">
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

      <div className="mt-4 border-t border-outline-variant pt-3">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Trạng thái</p>
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
                {s}
              </button>
            ))}
          </div>
        ) : (
          <Badge tone={clashStatusTone(clash.status)}>{clash.status}</Badge>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto border-t border-outline-variant pt-3">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">Lịch sử trao đổi</p>
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
