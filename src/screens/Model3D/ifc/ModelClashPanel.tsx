import { useState } from 'react'
import { X, AlertTriangle, ZoomIn } from 'lucide-react'
import type { ModelClashPoint } from '../../../data/modelClashes'

interface ModelClashPanelProps {
  clash: ModelClashPoint
  index: number
  total: number
  onClose: () => void
}

const IMAGE_LABELS = ['3D vị trí va chạm', 'Mặt bằng vị trí điểm va chạm']

export function ModelClashPanel({ clash, index, total, onClose }: ModelClashPanelProps) {
  // Bấm vào ảnh để phóng to xem toàn màn hình (theo yêu cầu người dùng 2026-08-25) - lightbox
  // đơn giản, không dùng thư viện ngoài. Lưu INDEX ảnh đang phóng to (không phải boolean) vì mỗi
  // va chạm có 2 ảnh (3D + mặt bằng, xem modelClashes.ts) - null = đang đóng.
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)

  return (
    <>
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

        <div className="space-y-3">
          {clash.images.map((img, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setZoomedIndex(i)}
                className="group relative block w-full cursor-zoom-in border border-outline-variant"
                title="Bấm để phóng to"
              >
                <img src={img} alt={`${clash.title} - ${IMAGE_LABELS[i] ?? i + 1}`} className="w-full" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                  <ZoomIn size={22} className="text-white drop-shadow" />
                </span>
              </button>
              {IMAGE_LABELS[i] && <p className="mt-1 text-[10px] text-on-surface-variant">{IMAGE_LABELS[i]}</p>}
            </div>
          ))}
        </div>
      </div>

      {zoomedIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-8"
          onClick={() => setZoomedIndex(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedIndex(null)}
            aria-label="Đóng"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <img
            src={clash.images[zoomedIndex]}
            alt={clash.title}
            className="max-h-full max-w-full cursor-zoom-out object-contain"
            onClick={(e) => {
              e.stopPropagation()
              setZoomedIndex(null)
            }}
          />
        </div>
      )}
    </>
  )
}
