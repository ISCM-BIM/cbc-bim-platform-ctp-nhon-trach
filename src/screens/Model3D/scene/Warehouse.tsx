import type { BlockId, Clash, Discipline } from '../../../types'
import { BLOCK_IDS } from '../../../data/constants'
import { BlockModel } from './BlockModel'
import { SiteInfra } from './SiteInfra'
import { ClashMarkers } from './ClashMarkers'
import type { SceneMaterials } from './materials'

interface WarehouseProps {
  currentMonth: number
  visible: Record<Discipline, boolean>
  selectedBlock: BlockId | 'all'
  materials: SceneMaterials
  clashMarkers: Clash[]
  selectedClashId: string | null
  onSelectClash: (clash: Clash | null) => void
}

export function Warehouse({
  currentMonth,
  visible,
  selectedBlock,
  materials,
  clashMarkers,
  selectedClashId,
  onSelectClash,
}: WarehouseProps) {
  const blocksToRender = selectedBlock === 'all' ? BLOCK_IDS : [selectedBlock]

  return (
    <group>
      <SiteInfra visible={visible['Hạ tầng']} materials={materials} />
      {blocksToRender.map((id) => (
        <BlockModel key={id} blockId={id} currentMonth={currentMonth} visible={visible} materials={materials} />
      ))}
      <ClashMarkers clashes={clashMarkers} selectedId={selectedClashId} onSelect={onSelectClash} />
    </group>
  )
}
