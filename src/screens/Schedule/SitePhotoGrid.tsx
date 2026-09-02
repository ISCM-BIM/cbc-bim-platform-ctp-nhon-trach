import { Info, Camera } from 'lucide-react'
import { sitePhotos } from '../../data/sitePhotos'
import { Badge } from '../../components/common/Badge'
import { useLanguage } from '../../i18n/LanguageContext'

export function SitePhotoGrid() {
  const { language, tr } = useLanguage()
  if (sitePhotos.length === 0) {
    return (
      <div className="panel p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">{tr('Hình ảnh hiện trường theo mốc thời gian', 'Site photos by timeline')}</p>
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Camera size={22} className="text-outline" />
          <p className="text-xs text-on-surface-variant">
            {tr('Chưa có ảnh công trường - dự án chưa khởi công.', 'No site photos yet - the project has not broken ground.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-on-surface">{tr('Hình ảnh hiện trường theo mốc thời gian', 'Site photos by timeline')}</p>
        <Badge tone="warning">{tr('Ảnh minh hoạ', 'Illustrative photos')}</Badge>
      </div>
      <p className="mb-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-on-surface-variant">
        <Info size={13} className="mt-0.5 shrink-0" />
        {tr(
          'Ảnh thi công thực tế do CBC cung cấp, minh hoạ quy trình theo từng hạng mục. Ảnh chụp tại một công trường khác của CBC (còn watermark gốc trên ảnh), chưa phải ảnh thật của công trường dự án này.',
          'Real construction photos provided by CBC, illustrating the workflow for each work item. Photos were taken at a different CBC job site (original watermark retained on the images) - not actual photos of this project’s site yet.',
        )}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sitePhotos.map((p, i) => {
          const phase = language === 'en' ? p.phaseEn : p.phase
          const note = language === 'en' ? p.noteEn : p.note
          return (
          <div key={p.id} className="overflow-hidden border border-outline-variant">
            <div className="relative h-28 overflow-hidden bg-surface-container-high sm:h-32">
              <img src={p.image} alt={phase} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute left-1.5 top-1.5 bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-on-surface">
                {i + 1}/{sitePhotos.length}
              </span>
            </div>
            <div className="bg-surface-container-lowest px-2.5 py-2">
              <p className="truncate text-[11px] font-medium text-on-surface" title={phase}>
                {phase}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-on-surface-variant" title={note}>
                {note}
              </p>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
