import { useState, type ReactNode } from 'react'
import { History } from 'lucide-react'
import type { BlockId } from '../../types'
import { fieldChanges } from '../../data/fieldChanges'
import { BLOCKS } from '../../data/constants'
import { Badge } from '../../components/common/Badge'
import { fieldChangeStatusTone } from '../../utils/tone'
import { formatDate } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { disciplineLabel, fieldChangeStatusLabel } from '../../i18n/enumLabels'

type BlockFilter = 'all' | BlockId

export function FieldChangeTimeline() {
  const { language, tr } = useLanguage()
  const [blockFilter, setBlockFilter] = useState<BlockFilter>('all')
  const items = [...fieldChanges]
    .filter((c) => blockFilter === 'all' || c.block === blockFilter)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-on-surface">{tr('Dòng thời gian thay đổi hiện trường', 'Field change timeline')}</p>
        <div className="flex gap-1.5">
          <FilterChip active={blockFilter === 'all'} onClick={() => setBlockFilter('all')}>
            {tr('Tất cả', 'All')}
          </FilterChip>
          {BLOCKS.map((b) => (
            <FilterChip key={b.id} active={blockFilter === b.id} onClick={() => setBlockFilter(b.id)}>
              {b.id}
            </FilterChip>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <History size={22} className="text-outline" />
          <p className="text-xs text-on-surface-variant">
            {tr('Chưa có thay đổi hiện trường nào - dự án chưa ký hợp đồng.', 'No field changes yet - the project has not been contracted.')}
          </p>
        </div>
      ) : (
      <div className="max-h-[520px] space-y-0 overflow-y-auto pr-1">
        {items.map((c, i) => (
          <div key={c.id} className="relative flex gap-3 pb-4 pl-1">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-brand bg-surface-container-lowest" />
              {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-surface-container-high" />}
            </div>
            <div className="flex-1 pb-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface-variant">{formatDate(c.date)}</span>
                <span>·</span>
                <span>Block {c.block}</span>
                <span>·</span>
                <span>{disciplineLabel(c.discipline, language)}</span>
                <Badge tone={fieldChangeStatusTone(c.modelStatus)} className="ml-auto">
                  {fieldChangeStatusLabel(c.modelStatus, language)}
                </Badge>
              </div>
              <p className="text-sm text-on-surface">{c.description}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-on-surface-variant">
                <span>{tr('Lý do', 'Reason')}: {c.reason}</span>
                <span>{tr('Người báo', 'Reported by')}: {c.reporter}</span>
                <span>{tr('Ảnh hưởng KL', 'Quantity impact')}: {c.quantityImpact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-brand text-white' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {children}
    </button>
  )
}
