import { X, AlertTriangle } from 'lucide-react'
import type { ModelClashPoint } from '../../../data/modelClashes'

interface ModelClashPanelProps {
  clash: ModelClashPoint
  index: number
  total: number
  onClose: () => void
}

export function ModelClashPanel({ clash, index, total, onClose }: ModelClashPanelProps) {
  return (
    <div className="panel-strong absolute right-4 top-4 max-h-[calc(100%-2rem)] w-80 overflow-y-auto p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="label-caps flex items-center gap-1.5 text-brand">
          <AlertTriangle size={13} /> Va chạm đã kiểm tra ({index + 1}/{total})
        </p>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      <p className="mb-3 text-sm font-semibold leading-snug text-on-surface">{clash.title}</p>

      <img src={clash.image} alt={clash.title} className="w-full border border-outline-variant" />

      <p className="mt-3 border-t border-outline-variant pt-3 text-[11px] leading-relaxed text-on-surface-variant">
        Ảnh chụp kiểm tra va chạm thật từ mô hình phối hợp (CBC cung cấp). Vị trí điểm đánh dấu
        trên mô hình 3D đặt tại cấu kiện cột thật gần đúng, không phải toạ độ chính xác 1-1 từ hồ
        sơ gốc.
      </p>
    </div>
  )
}
