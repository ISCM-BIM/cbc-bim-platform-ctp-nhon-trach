import { useMemo, useState, type ReactNode } from 'react'
import type { BlockId, Equipment, EquipmentSystem } from '../../types'
import { equipment } from '../../data/equipment'
import { BLOCKS } from '../../data/constants'
import { EquipmentTable } from './EquipmentTable'
import { EquipmentDetailPanel } from './EquipmentDetailPanel'
import { TenantInfoPanel } from './TenantInfoPanel'
import { MaintenanceCalendar } from './MaintenanceCalendar'
import { useLanguage } from '../../i18n/LanguageContext'
import { equipmentSystemLabel } from '../../i18n/enumLabels'

type BlockFilter = 'all' | BlockId
type SystemFilter = 'all' | EquipmentSystem

const SYSTEMS: EquipmentSystem[] = ['PCCC', 'Điện', 'Cấp thoát nước', 'HVAC', 'Hạ tầng']

export function Assets() {
  const { language, tr } = useLanguage()
  const [systemFilter, setSystemFilter] = useState<SystemFilter>('all')
  const [blockFilter, setBlockFilter] = useState<BlockFilter>('all')
  const [selected, setSelected] = useState<Equipment | null>(null)

  const filtered = useMemo(
    () =>
      equipment.filter((eq) => {
        if (systemFilter !== 'all' && eq.system !== systemFilter) return false
        if (blockFilter !== 'all' && eq.block !== blockFilter) return false
        return true
      }),
    [systemFilter, blockFilter],
  )

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        <TenantInfoPanel />

        <div className="flex flex-wrap items-center gap-3 panel p-3">
          <FilterGroup label={tr('Hệ thống', 'System')}>
            <FilterChip active={systemFilter === 'all'} onClick={() => setSystemFilter('all')}>
              {tr('Tất cả', 'All')}
            </FilterChip>
            {SYSTEMS.map((s) => (
              <FilterChip key={s} active={systemFilter === s} onClick={() => setSystemFilter(s)}>
                {equipmentSystemLabel(s, language)}
              </FilterChip>
            ))}
          </FilterGroup>
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
          <span className="ml-auto text-xs text-on-surface-variant">
            {filtered.length} / {equipment.length} {tr('thiết bị', 'equipment items')}
          </span>
        </div>

        <EquipmentTable items={filtered} selectedId={selected?.id ?? null} onSelect={setSelected} />

        <MaintenanceCalendar />
      </div>

      {selected && <EquipmentDetailPanel equipment={selected} onClose={() => setSelected(null)} />}
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
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-brand text-white' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {children}
    </button>
  )
}
