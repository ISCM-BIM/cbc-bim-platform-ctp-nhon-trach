import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ScheduleItem } from '../../types'
import { Badge } from '../../components/common/Badge'
import { scheduleStatusTone } from '../../utils/tone'
import { formatDate } from '../../utils/format'

interface ScheduleTableProps {
  items: ScheduleItem[]
  collapsed: Set<string>
  onToggle: (wbsCode: string) => void
}

export function ScheduleTable({ items, collapsed, onToggle }: ScheduleTableProps) {
  return (
    <div className="shrink-0 overflow-hidden panel">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full min-w-[920px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-surface-container-lowest text-on-surface-variant">
            <tr>
              <th className="px-3 py-2.5 font-medium">Hạng mục</th>
              <th className="px-3 py-2.5 font-medium">Block</th>
              <th className="px-3 py-2.5 font-medium">Bộ môn</th>
              <th className="px-3 py-2.5 font-medium">Bắt đầu - Kết thúc (KH)</th>
              <th className="px-3 py-2.5 font-medium text-right">% hoàn thành</th>
              <th className="px-3 py-2.5 font-medium">Trạng thái</th>
              <th className="px-3 py-2.5 font-medium">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isCollapsed = item.isSummary && collapsed.has(item.wbsCode)
              return (
                <tr
                  key={item.id}
                  className={`border-t border-outline-variant text-on-surface-variant hover:bg-surface-container-lowest/60 ${
                    item.isSummary ? 'bg-surface-container-low' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div
                      className={`flex items-center gap-1.5 ${item.isSummary ? 'font-semibold text-on-surface' : 'font-medium text-on-surface'}`}
                      style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                    >
                      {item.isSummary ? (
                        <button
                          type="button"
                          onClick={() => onToggle(item.wbsCode)}
                          className="shrink-0 text-outline hover:text-on-surface"
                          aria-label={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        </button>
                      ) : (
                        <span className="inline-block w-3 shrink-0" />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">{item.block}</td>
                  <td className="px-3 py-2.5">{item.discipline}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-on-surface-variant">
                    {formatDate(item.plannedStart)} - {formatDate(item.plannedEnd)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{item.percentComplete}%</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={scheduleStatusTone(item.status)}>
                      {item.status}
                      {item.delayDays > 0 ? ` (+${item.delayDays}d)` : ''}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{item.note || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
