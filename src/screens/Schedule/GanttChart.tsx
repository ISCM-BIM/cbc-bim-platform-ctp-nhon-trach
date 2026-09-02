import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ScheduleItem } from '../../types'
import { PROJECT_START, ELAPSED_DAYS, TOTAL_PROJECT_DAYS, CURRENT_DATE, STATUS_COLORS } from '../../data/constants'
import { addMonths, daysBetween } from '../../utils/random'
import { formatMonthShort } from '../../utils/format'
import { rangePercent, datePercent } from './ganttMath'
import { useLanguage } from '../../i18n/LanguageContext'

interface GanttChartProps {
  items: ScheduleItem[]
  collapsed: Set<string>
  onToggle: (wbsCode: string) => void
}

// Cột theo tháng dựng ĐỘNG theo đúng độ dài thật của dự án (TOTAL_PROJECT_DAYS, ~419 ngày ≈ 14
// tháng) - không hard-code 9 tháng như bản cũ (khi đó khớp vì dự án cũ ngắn hơn, giờ với mốc thời
// gian mới (404 ngày thi công, tổng ~419 ngày kể cả mốc đầu/cuối) chỉ vẽ 9 cột sẽ lệch hẳn so với
// vị trí thanh tiến độ thật, vốn đã tính đúng theo TOTAL_PROJECT_DAYS trong ganttMath.ts).
function buildMonthColumns(): Date[] {
  const months: Date[] = []
  let cursor = PROJECT_START
  while (daysBetween(PROJECT_START, cursor) <= TOTAL_PROJECT_DAYS) {
    months.push(cursor)
    cursor = addMonths(cursor, 1)
  }
  return months
}
const MONTHS = buildMonthColumns()

// Dùng thẳng STATUS_COLORS để khớp màu với chú giải bên dưới (bg-status-success/danger).
function barColor(status: ScheduleItem['status']): string {
  if (status === 'Chậm tiến độ') return STATUS_COLORS.danger
  if (status === 'Chưa bắt đầu') return 'transparent'
  return STATUS_COLORS.success
}

export function GanttChart({ items, collapsed, onToggle }: GanttChartProps) {
  const { language, tr } = useLanguage()
  const todayPercent = (ELAPSED_DAYS / TOTAL_PROJECT_DAYS) * 100

  return (
    <div className="panel p-4">
      <div className="flex">
        <div className="w-64 shrink-0" />
        <div className="relative flex-1">
          <div className="relative h-4 text-[11px] text-on-surface-variant">
            {MONTHS.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 border-l border-outline-variant pl-1.5"
                style={{ left: `${datePercent(m)}%` }}
              >
                {formatMonthShort(m, language)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item) => {
          const planned = rangePercent(item.plannedStart, item.plannedEnd)
          const hasActual = item.status !== 'Chưa bắt đầu'
          const actualEnd = item.actualEnd ?? CURRENT_DATE
          const actual = hasActual ? rangePercent(item.actualStart ?? item.plannedStart, actualEnd) : null
          const isCollapsed = item.isSummary && collapsed.has(item.wbsCode)
          const name = language === 'en' ? item.nameEn : item.name

          return (
            <div
              key={item.id}
              className={`flex items-center border-t border-outline-variant py-1.5 first:border-t-0 ${
                item.isSummary ? 'bg-surface-container-low' : ''
              }`}
            >
              <div
                className="flex w-64 shrink-0 items-center gap-1 truncate pr-3 text-xs text-on-surface-variant"
                style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                title={name}
              >
                {item.isSummary ? (
                  <button
                    type="button"
                    onClick={() => onToggle(item.wbsCode)}
                    className="shrink-0 text-outline hover:text-on-surface"
                    aria-label={isCollapsed ? tr('Mở rộng', 'Expand') : tr('Thu gọn', 'Collapse')}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </button>
                ) : (
                  <span className="inline-block w-3 shrink-0" />
                )}
                <span className={`truncate ${item.isSummary ? 'font-semibold text-on-surface' : ''}`}>
                  {name}
                </span>
              </div>
              <div className="relative h-6 flex-1 bg-surface-container-lowest">
                {MONTHS.map((m, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-outline-variant"
                    style={{ left: `${datePercent(m)}%` }}
                  />
                ))}
                <div
                  className="absolute z-10 h-1.5 rounded-full bg-surface-container-high"
                  style={{ left: `${planned.left}%`, width: `${planned.width}%`, top: '4px' }}
                  title={`${tr('Kế hoạch', 'Planned')}: ${name}`}
                />
                {actual && (
                  <div
                    className="absolute z-10 h-1.5 rounded-full"
                    style={{
                      left: `${actual.left}%`,
                      width: `${actual.width}%`,
                      top: '14px',
                      backgroundColor: barColor(item.status),
                    }}
                    title={`${tr('Thực tế', 'Actual')}: ${name}`}
                  />
                )}
                <div
                  className="absolute top-0 z-20 h-full w-px bg-status-info/70"
                  style={{ left: `${todayPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-5 border-t border-outline-variant pt-3 text-[11px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-surface-container-high" /> {tr('Kế hoạch', 'Planned')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-status-success" /> {tr('Đúng/hoàn thành', 'On track / completed')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-status-danger" /> {tr('Chậm tiến độ', 'Delayed')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-px bg-status-info" /> {tr('Hôm nay', 'Today')} ({Math.round(datePercent(CURRENT_DATE))}%)
        </span>
      </div>
    </div>
  )
}
