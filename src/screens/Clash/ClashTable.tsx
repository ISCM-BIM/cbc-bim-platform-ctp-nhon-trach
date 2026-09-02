import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { Clash } from '../../types'
import { Badge } from '../../components/common/Badge'
import { clashSeverityTone, clashStatusTone } from '../../utils/tone'
import { formatDate, formatVNDShort } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { clashStatusLabel } from '../../i18n/enumLabels'

export type SortKey = 'id' | 'severity' | 'block' | 'estimatedCost' | 'status' | 'dueDate'
export interface SortState {
  key: SortKey
  direction: 'asc' | 'desc'
}

interface ClashTableProps {
  items: Clash[]
  selectedId: string | null
  onSelect: (clash: Clash) => void
  sort: SortState
  onSortChange: (sort: SortState) => void
}

const COLUMNS: Array<{ key: SortKey; label: string; labelEn: string; align?: 'right' }> = [
  { key: 'id', label: 'Mã', labelEn: 'Code' },
  { key: 'severity', label: 'Mức độ', labelEn: 'Severity' },
  { key: 'block', label: 'Block', labelEn: 'Block' },
  { key: 'estimatedCost', label: 'Chi phí ước tính', labelEn: 'Estimated cost', align: 'right' },
  { key: 'status', label: 'Trạng thái', labelEn: 'Status' },
  { key: 'dueDate', label: 'Hạn xử lý', labelEn: 'Due date' },
]

export function ClashTable({ items, selectedId, onSelect, sort, onSortChange }: ClashTableProps) {
  const { language, tr } = useLanguage()
  const toggleSort = (key: SortKey) => {
    if (sort.key === key) {
      onSortChange({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ key, direction: 'asc' })
    }
  }

  return (
    <div className="shrink-0 overflow-hidden panel">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-surface-container-lowest text-on-surface-variant">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className={`px-3 py-2.5 font-medium ${col.align === 'right' ? 'text-right' : ''}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={`flex items-center gap-1 hover:text-on-surface ${col.align === 'right' ? 'ml-auto' : ''}`}
                  >
                    {language === 'en' ? col.labelEn : col.label}
                    {sort.key === col.key ? (
                      sort.direction === 'asc' ? (
                        <ArrowUp size={11} />
                      ) : (
                        <ArrowDown size={11} />
                      )
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 font-medium">{tr('Mô tả', 'Description')}</th>
              <th className="px-3 py-2.5 font-medium">{tr('Phụ trách', 'Assignee')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className={`cursor-pointer border-t border-outline-variant text-on-surface-variant hover:bg-surface-container-lowest/60 ${
                  selectedId === c.id ? 'bg-brand/10' : ''
                }`}
              >
                <td className="px-3 py-2.5 font-mono text-on-surface-variant">{c.id}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={clashSeverityTone(c.severity)}>{c.severity}</Badge>
                </td>
                <td className="px-3 py-2.5">{c.block}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-on-surface">
                  {formatVNDShort(c.estimatedCost, language)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone={clashStatusTone(c.status)}>{clashStatusLabel(c.status, language)}</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-on-surface-variant">{formatDate(c.dueDate)}</td>
                <td className="max-w-xs truncate px-3 py-2.5 text-on-surface-variant" title={c.description}>
                  {c.description}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-on-surface-variant">{c.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
            {tr('Không có xung đột phù hợp bộ lọc.', 'No clashes match the current filters.')}
          </p>
        )}
      </div>
    </div>
  )
}
