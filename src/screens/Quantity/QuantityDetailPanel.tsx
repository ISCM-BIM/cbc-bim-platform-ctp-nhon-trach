import { X, Box, Layers3, MapPin, History } from 'lucide-react'
import type { QuantityItem } from '../../data/quantities'
import { Badge } from '../../components/common/Badge'
import { formatNumber, formatVNDShort } from '../../utils/format'
import { modelVersions } from '../../data/modelVersions'
import { useLanguage, type Language } from '../../i18n/LanguageContext'
import { disciplineLabel, quantityGroupLabel, quantityStatusLabel, unitLabel } from '../../i18n/enumLabels'

interface QuantityDetailPanelProps {
  item: QuantityItem
  onClose: () => void
  onViewOn3D: (item: QuantityItem) => void
}

function componentBreakdown(item: QuantityItem, language: Language): string[] {
  const name = language === 'en' ? item.nameEn : item.name
  const discipline = disciplineLabel(item.discipline, language)
  if (language === 'en') {
    const scope = item.block === 'Toàn dự án' ? 'the entire project site' : `Block ${item.block}`
    return [
      `All ${discipline} components within ${scope} tagged with the property "${name}"`,
      `Quantity computed from actual 3D geometry (real dimensions) times the material property assigned to each component`,
      `Excludes construction wastage - model quantity is the net quantity`,
    ]
  }
  const base = item.block === 'Toàn dự án' ? 'toàn bộ mặt bằng dự án' : `Block ${item.block}`
  return [
    `Toàn bộ cấu kiện thuộc bộ môn ${discipline} trong phạm vi ${base} có gắn thuộc tính "${name}"`,
    `Khối lượng tính từ hình học 3D (kích thước thực) nhân với thuộc tính vật liệu gán trên từng cấu kiện`,
    `Không bao gồm hao hụt thi công - khối lượng mô hình là khối lượng tịnh (net)`,
  ]
}

export function QuantityDetailPanel({ item, onClose, onViewOn3D }: QuantityDetailPanelProps) {
  const { language, tr } = useLanguage()
  const name = language === 'en' ? item.nameEn : item.name
  const relevantVersions = modelVersions.slice(-3)

  return (
    <div className="panel flex h-full w-96 shrink-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-on-surface-variant">{item.id}</span>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      <p className="mb-3 font-heading text-sm font-semibold text-on-surface">{name}</p>

      <div className="space-y-1.5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <Layers3 size={13} className="text-outline" />
          {quantityGroupLabel(item.group, language)}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-outline" />
          {item.block === 'Toàn dự án' ? tr('Toàn dự án', 'Entire project') : `Block ${item.block}`}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="border border-outline-variant bg-surface-container-low p-2.5">
          <p className="text-[10px] text-on-surface-variant">{tr('KL hợp đồng', 'Contract qty')}</p>
          <p className="font-heading text-sm font-semibold text-on-surface">
            {formatNumber(item.contractQty)} {unitLabel(item.unit, language)}
          </p>
        </div>
        <div className="border border-outline-variant bg-surface-container-low p-2.5">
          <p className="text-[10px] text-on-surface-variant">{tr('KL từ mô hình', 'Model qty')}</p>
          <p className="font-heading text-sm font-semibold text-on-surface">
            {formatNumber(item.modelQty)} {unitLabel(item.unit, language)}
          </p>
        </div>
      </div>

      <div className="mt-2 border border-outline-variant bg-surface-container-low p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-on-surface-variant">{tr('Ảnh hưởng chi phí', 'Cost impact')}</p>
          <Badge tone={item.status === 'Chênh lệch lớn' ? 'danger' : item.status === 'Cần rà soát' ? 'warning' : 'success'}>
            {quantityStatusLabel(item.status, language)}
          </Badge>
        </div>
        <p className="font-heading text-lg font-semibold text-on-surface">
          {item.costImpact > 0 ? '+' : ''}
          {formatVNDShort(item.costImpact, language)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onViewOn3D(item)}
        className="pop-shadow mt-3 flex items-center justify-center gap-2 bg-brand px-3 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
      >
        <Box size={15} /> {tr('Xem trên mô hình 3D', 'View on 3D model')}
      </button>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">
          {tr('Diễn giải bóc khối lượng từ mô hình', 'Model quantity takeoff explanation')}
        </p>
        <ul className="space-y-1.5">
          {componentBreakdown(item, language).map((line, i) => (
            <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-on-surface-variant">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-surface-container-high" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
          <History size={12} /> {tr('Lịch sử thay đổi khối lượng qua các phiên bản', 'Quantity change history across versions')}
        </p>
        <div className="space-y-1.5">
          {relevantVersions.map((v) => (
            <div key={v.version} className="flex items-center justify-between border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-xs">
              <span className="font-mono text-on-surface-variant">{v.version}</span>
              <span className="text-on-surface-variant">
                {v.changesIntegrated} {tr('thay đổi tích hợp', 'changes integrated')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
