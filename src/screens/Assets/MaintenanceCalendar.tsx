import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Wrench } from 'lucide-react'
import { equipment } from '../../data/equipment'
import { CURRENT_DATE } from '../../data/constants'
import { formatMonthLabel } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarTask {
  equipmentId: string
  equipmentName: string
  task: string
}

export function MaintenanceCalendar() {
  const { language, tr } = useLanguage()
  const weekdayLabels = language === 'en' ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS
  const [cursor, setCursor] = useState(() => new Date(CURRENT_DATE.getFullYear(), CURRENT_DATE.getMonth(), 1))

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()
    equipment.forEach((eq) => {
      eq.upcomingMaintenance.forEach((m) => {
        if (m.date.getFullYear() === cursor.getFullYear() && m.date.getMonth() === cursor.getMonth()) {
          const key = m.date.getDate()
          const list = map.get(String(key)) ?? []
          list.push({ equipmentId: eq.id, equipmentName: eq.name, task: m.task })
          map.set(String(key), list)
        }
      })
    })
    return map
  }, [cursor])

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const totalTasks = Array.from(tasksByDay.values()).reduce((s, l) => s + l.length, 0)

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">{tr('Lịch bảo trì', 'Maintenance calendar')}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="w-24 text-center text-xs font-medium text-on-surface-variant">{formatMonthLabel(cursor, language)}</span>
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-on-surface-variant">
        {weekdayLabels.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          const tasks = day ? tasksByDay.get(String(day)) : undefined
          const isToday =
            day === CURRENT_DATE.getDate() &&
            cursor.getMonth() === CURRENT_DATE.getMonth() &&
            cursor.getFullYear() === CURRENT_DATE.getFullYear()
          return (
            <div
              key={i}
              className={`flex h-14 flex-col items-center justify-start  border px-1 py-1 ${
                day ? 'border-outline-variant bg-surface-container-lowest' : 'border-transparent'
              } ${isToday ? 'ring-1 ring-status-info' : ''}`}
            >
              {day && (
                <>
                  <span className="text-[10px] text-on-surface-variant">{day}</span>
                  {tasks && tasks.length > 0 && (
                    <span
                      className="mt-1 flex items-center gap-0.5 rounded-full bg-status-warning/20 px-1.5 py-0.5 text-[9px] font-medium text-status-warning"
                      title={tasks.map((t) => `${t.equipmentName}`).join(', ')}
                    >
                      <Wrench size={8} /> {tasks.length}
                    </span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-on-surface-variant">{totalTasks} {tr('mốc bảo trì trong tháng này', 'maintenance tasks this month')}</p>
    </div>
  )
}
