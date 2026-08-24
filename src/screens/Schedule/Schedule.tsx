import { useMemo, useState, type ReactNode } from 'react'
import type { BlockId, Discipline, ScheduleItem } from '../../types'
import { scheduleItems } from '../../data/schedule'
import { BLOCKS, DISCIPLINES } from '../../data/constants'
import { GanttChart } from './GanttChart'
import { ScheduleTable } from './ScheduleTable'
import { SitePhotoGrid } from './SitePhotoGrid'
import { computeVisibleRows, defaultCollapsedSet } from './scheduleTree'

type BlockFilter = 'all' | BlockId
type DisciplineFilter = 'all' | Discipline

// Bỏ dòng gốc "TIẾN ĐỘ THI CÔNG" (level 0, gộp 100% toàn dự án) khỏi hiển thị - không mang thêm
// thông tin gì ngoài những gì tiêu đề màn hình đã nói, chỉ chiếm chỗ dòng đầu cây.
const DISPLAY_ITEMS = scheduleItems.filter((it) => it.level > 0)

export function Schedule() {
  const [blockFilter, setBlockFilter] = useState<BlockFilter>('all')
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('all')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => defaultCollapsedSet(DISPLAY_ITEMS))

  const filterActive = blockFilter !== 'all' || disciplineFilter !== 'all'

  const matchesLeaf = (item: ScheduleItem) => {
    const blockOk = blockFilter === 'all' || item.block === blockFilter || item.block === 'Toàn dự án'
    const disciplineOk = disciplineFilter === 'all' || item.discipline === disciplineFilter
    return blockOk && disciplineOk
  }

  const visibleItems = useMemo(
    () => computeVisibleRows(DISPLAY_ITEMS, collapsed, matchesLeaf, filterActive),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapsed, blockFilter, disciplineFilter],
  )

  const toggleCollapse = (wbsCode: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(wbsCode)) next.delete(wbsCode)
      else next.add(wbsCode)
      return next
    })
  }

  const leafCount = DISPLAY_ITEMS.filter((i) => !i.isSummary).length

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-3 panel p-3">
        <FilterGroup label="Lọc theo block">
          <FilterChip active={blockFilter === 'all'} onClick={() => setBlockFilter('all')}>
            Tất cả
          </FilterChip>
          {BLOCKS.map((b) => (
            <FilterChip key={b.id} active={blockFilter === b.id} onClick={() => setBlockFilter(b.id)}>
              {b.id}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Bộ môn">
          <FilterChip active={disciplineFilter === 'all'} onClick={() => setDisciplineFilter('all')}>
            Tất cả
          </FilterChip>
          {DISCIPLINES.map((d) => (
            <FilterChip key={d} active={disciplineFilter === d} onClick={() => setDisciplineFilter(d)}>
              {d}
            </FilterChip>
          ))}
        </FilterGroup>
        <div className="ml-auto flex items-center gap-3 text-xs text-on-surface-variant">
          <span>
            {leafCount} hạng mục thi công · {DISPLAY_ITEMS.length} dòng WBS đầy đủ theo hồ sơ MS Project
          </span>
          {!filterActive && (
            <>
              <button type="button" onClick={() => setCollapsed(new Set())} className="btn-ghost">
                Mở hết
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(defaultCollapsedSet(DISPLAY_ITEMS))}
                className="btn-ghost"
              >
                Thu gọn mặc định
              </button>
            </>
          )}
        </div>
      </div>

      <GanttChart items={visibleItems} collapsed={collapsed} onToggle={toggleCollapse} />
      <ScheduleTable items={visibleItems} collapsed={collapsed} onToggle={toggleCollapse} />
      <SitePhotoGrid />
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-on-surface-variant">{label}:</span>
      {children}
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
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-brand text-white' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {children}
    </button>
  )
}
