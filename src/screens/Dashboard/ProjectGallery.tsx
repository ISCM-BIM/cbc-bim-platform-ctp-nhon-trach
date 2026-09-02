import { useState } from 'react'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { projectGallery } from '../../data/projectGallery'
import { useLanguage } from '../../i18n/LanguageContext'

export function ProjectGallery() {
  const { language, tr } = useLanguage()
  const [index, setIndex] = useState(0)
  const total = projectGallery.length
  if (total === 0) return null
  const current = projectGallery[index]
  const caption = language === 'en' ? current.captionEn : current.caption

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total)

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-on-surface">
          <Images size={15} /> {tr('Phối cảnh 3D dự án', 'Project 3D renderings')}
        </p>
        <p className="text-xs text-on-surface-variant">
          {index + 1}/{total}
        </p>
      </div>

      <div className="relative bg-surface-container-lowest">
        <img
          key={current.id}
          src={current.url}
          alt={caption}
          className="aspect-[16/9] w-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={tr('Ảnh trước', 'Previous image')}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-navy-deep/70 text-white transition-colors hover:bg-navy-deep"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={tr('Ảnh tiếp theo', 'Next image')}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-navy-deep/70 text-white transition-colors hover:bg-navy-deep"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="truncate text-xs text-on-surface-variant">{caption}</p>
        {total > 1 && (
          <div className="flex shrink-0 gap-1.5">
            {projectGallery.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${tr('Xem ảnh', 'View image')} ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-brand' : 'bg-outline-variant hover:bg-outline'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
