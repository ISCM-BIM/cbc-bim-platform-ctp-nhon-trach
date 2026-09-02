import { useState } from 'react'
import { ArrowRight, ImageOff } from 'lucide-react'
import { fieldChanges } from '../../data/fieldChanges'
import { formatDate } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

const OPTIONS = [...fieldChanges].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20)

export function BeforeAfterCompare() {
  const { tr } = useLanguage()
  const [selectedId, setSelectedId] = useState(OPTIONS[0]?.id ?? '')
  const change = OPTIONS.find((c) => c.id === selectedId) ?? OPTIONS[0]

  if (OPTIONS.length === 0) {
    return (
      <div className="panel p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">{tr('So sánh trước / sau thay đổi', 'Before / after comparison')}</p>
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <ImageOff size={22} className="text-outline" />
          <p className="text-xs text-on-surface-variant">{tr('Chưa có thay đổi hiện trường nào để so sánh.', 'No field changes to compare yet.')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-on-surface">{tr('So sánh trước / sau thay đổi', 'Before / after comparison')}</p>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs text-on-surface-variant focus:outline-none"
        >
          {OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {formatDate(c.date)} · Block {c.block} · {c.description.slice(0, 40)}...
            </option>
          ))}
        </select>
      </div>

      {change && (
        <>
          <p className="mb-3 text-xs text-on-surface-variant">{change.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex h-40 items-center justify-center border border-outline-variant bg-surface-container-lowest text-outline">
                <div className="flex flex-col items-center gap-1.5">
                  <ImageOff size={22} />
                  <span className="text-[11px]">{tr('Trước thay đổi (minh hoạ)', 'Before change (illustrative)')}</span>
                </div>
              </div>
            </div>
            <ArrowRight size={18} className="shrink-0 text-outline" />
            <div className="flex-1">
              <div className="flex h-40 items-center justify-center border border-status-success/40 bg-status-success/5 text-outline">
                <div className="flex flex-col items-center gap-1.5">
                  <ImageOff size={22} />
                  <span className="text-[11px]">{tr('Sau thay đổi (minh hoạ)', 'After change (illustrative)')}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
