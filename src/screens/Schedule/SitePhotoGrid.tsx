import { Info, Camera } from 'lucide-react'
import { sitePhotos } from '../../data/sitePhotos'
import { Badge } from '../../components/common/Badge'

export function SitePhotoGrid() {
  if (sitePhotos.length === 0) {
    return (
      <div className="panel p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">Hình ảnh hiện trường theo mốc thời gian</p>
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Camera size={22} className="text-outline" />
          <p className="text-xs text-on-surface-variant">
            Chưa có ảnh công trường - dự án chưa khởi công.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-on-surface">Hình ảnh hiện trường theo mốc thời gian</p>
        <Badge tone="warning">Ảnh minh hoạ</Badge>
      </div>
      <p className="mb-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-on-surface-variant">
        <Info size={13} className="mt-0.5 shrink-0" />
        Ảnh thi công thực tế do CBC cung cấp, minh hoạ quy trình theo từng hạng mục. Ảnh chụp tại một
        công trường khác của CBC (còn watermark gốc trên ảnh), chưa phải ảnh thật của công trường dự
        án này.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sitePhotos.map((p, i) => (
          <div key={p.id} className="overflow-hidden border border-outline-variant">
            <div className="relative h-28 overflow-hidden bg-surface-container-high sm:h-32">
              <img src={p.image} alt={p.phase} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute left-1.5 top-1.5 bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-on-surface">
                {i + 1}/{sitePhotos.length}
              </span>
            </div>
            <div className="bg-surface-container-lowest px-2.5 py-2">
              <p className="truncate text-[11px] font-medium text-on-surface" title={p.phase}>
                {p.phase}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-on-surface-variant" title={p.note}>
                {p.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
