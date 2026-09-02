import { useMemo, useState, type ReactNode } from 'react'
import { FileBarChart, TrendingUp, AlertTriangle, Gauge, Wallet } from 'lucide-react'
import type { BlockId, Discipline } from '../../types'
import { quantityItems, QUANTITY_GROUPS, type QuantityStatus } from '../../data/quantities'
import { BLOCKS, DISCIPLINES } from '../../data/constants'
import {
  getContractValue,
  getExecutedValue,
  getTotalQuantityVariance,
  getFlaggedQuantityCount,
  MODEL_TAKEOFF_COVERAGE,
} from '../../utils/metrics'
import { formatVNDShort } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { disciplineLabel, quantityStatusLabel } from '../../i18n/enumLabels'
import { KpiCard } from '../../components/common/KpiCard'
import { QuantityCharts } from './QuantityCharts'
import { QuantityTable } from './QuantityTable'
import { QuantityDetailPanel } from './QuantityDetailPanel'
import { ProcurementBatches } from './ProcurementBatches'

type BlockFilter = 'all' | BlockId
type DisciplineFilter = 'all' | Discipline
type StatusFilter = 'all' | QuantityStatus
type SortKey = 'costImpact' | 'diffPercent' | 'id'

const STATUSES: QuantityStatus[] = ['Khớp', 'Cần rà soát', 'Chênh lệch lớn']

interface QuantityProps {
  onViewOn3D: (discipline: Discipline) => void
}

export function Quantity({ onViewOn3D }: QuantityProps) {
  const { language, tr } = useLanguage()
  const [blockFilter, setBlockFilter] = useState<BlockFilter>('all')
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('costImpact')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const list = quantityItems.filter((i) => {
      if (blockFilter !== 'all' && i.block !== blockFilter) return false
      if (disciplineFilter !== 'all' && i.discipline !== disciplineFilter) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      return true
    })
    return [...list].sort((a, b) => {
      if (sortKey === 'id') return a.id.localeCompare(b.id)
      if (sortKey === 'diffPercent') return Math.abs(b.diffPercent) - Math.abs(a.diffPercent)
      return Math.abs(b.costImpact) - Math.abs(a.costImpact)
    })
  }, [blockFilter, disciplineFilter, statusFilter, sortKey])

  const selected = quantityItems.find((i) => i.id === selectedId) ?? null

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard label={tr('Giá trị hợp đồng', 'Contract value')} value={formatVNDShort(getContractValue(), language)} icon={<Wallet size={16} />} accent="neutral" />
          <KpiCard label={tr('Giá trị đã thực hiện', 'Executed value')} value={formatVNDShort(getExecutedValue(), language)} icon={<TrendingUp size={16} />} accent="info" />
          <KpiCard
            label={tr('Chênh lệch khối lượng phát hiện', 'Quantity variance detected')}
            value={formatVNDShort(getTotalQuantityVariance(), language)}
            icon={<FileBarChart size={16} />}
            accent="brand"
          />
          <KpiCard label={tr('Hạng mục cảnh báo', 'Flagged items')} value={String(getFlaggedQuantityCount())} icon={<AlertTriangle size={16} />} accent="warning" />
          <KpiCard label={tr('KL bóc tự động từ mô hình', 'Model-based takeoff coverage')} value={`${MODEL_TAKEOFF_COVERAGE}%`} icon={<Gauge size={16} />} accent="success" />
        </div>

        <QuantityCharts />

        <div className="flex flex-wrap items-center gap-3 border border-outline-variant bg-surface-container-low p-3">
          <FilterGroup label="Block">
            <FilterChip active={blockFilter === 'all'} onClick={() => setBlockFilter('all')}>
              {tr('Tất cả', 'All')}
            </FilterChip>
            {BLOCKS.map((b) => (
              <FilterChip key={b.id} active={blockFilter === b.id} onClick={() => setBlockFilter(b.id)}>
                {b.id}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label={tr('Bộ môn', 'Discipline')}>
            <FilterChip active={disciplineFilter === 'all'} onClick={() => setDisciplineFilter('all')}>
              {tr('Tất cả', 'All')}
            </FilterChip>
            {DISCIPLINES.map((d) => (
              <FilterChip key={d} active={disciplineFilter === d} onClick={() => setDisciplineFilter(d)}>
                {disciplineLabel(d, language)}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label={tr('Trạng thái', 'Status')}>
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              {tr('Tất cả', 'All')}
            </FilterChip>
            {STATUSES.map((s) => (
              <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {quantityStatusLabel(s, language)}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label={tr('Sắp xếp', 'Sort by')}>
            <FilterChip active={sortKey === 'costImpact'} onClick={() => setSortKey('costImpact')}>
              {tr('Ảnh hưởng chi phí', 'Cost impact')}
            </FilterChip>
            <FilterChip active={sortKey === 'diffPercent'} onClick={() => setSortKey('diffPercent')}>
              {tr('% chênh lệch', '% variance')}
            </FilterChip>
            <FilterChip active={sortKey === 'id'} onClick={() => setSortKey('id')}>
              {tr('Mã', 'Code')}
            </FilterChip>
          </FilterGroup>
          <span className="ml-auto text-xs text-on-surface-variant">
            {filtered.length} / {quantityItems.length} {tr('hạng mục', 'items')} · {QUANTITY_GROUPS.length} {tr('nhóm công tác', 'work groups')}
          </span>
        </div>

        <QuantityTable items={filtered} selectedId={selectedId} onSelect={(i) => setSelectedId(i.id)} />

        <ProcurementBatches />
      </div>

      {selected && (
        <QuantityDetailPanel
          item={selected}
          onClose={() => setSelectedId(null)}
          onViewOn3D={(item) => onViewOn3D(item.discipline)}
        />
      )}
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

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-brand text-white' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {children}
    </button>
  )
}
