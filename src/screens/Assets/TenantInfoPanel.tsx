import { Ruler, Layers } from 'lucide-react'
import { tenantInfo } from '../../data/tenantInfo'
import { BLOCKS } from '../../data/constants'
import { formatNumber } from '../../utils/format'

const blockName = (id: string) => BLOCKS.find((b) => b.id === id)?.name ?? id

export function TenantInfoPanel() {
  const totalArea = tenantInfo.reduce((sum, t) => sum + t.areaM2, 0)

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">Thông số hạng mục công trình</p>
        <p className="text-xs text-on-surface-variant">
          {tenantInfo.length} hạng mục · {formatNumber(Math.round(totalArea))} m²
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tenantInfo.map((t) => (
          <div key={t.id} className="border border-outline-variant bg-surface-container-lowest p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug text-on-surface">{t.name}</p>
              <span className="shrink-0 text-[10px] text-on-surface-variant">{t.id}</span>
            </div>
            <p className="mb-2 truncate text-[11px] text-on-surface-variant" title={blockName(t.block)}>
              {blockName(t.block)}
            </p>
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Ruler size={12} /> Diện tích
                </span>
                <span className="text-on-surface">{formatNumber(t.areaM2)} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} /> Số tầng
                </span>
                <span className="text-on-surface">{t.storeys}</span>
              </div>
              {t.floorLoadTonPerM2 != null && (
                <div className="flex items-center justify-between">
                  <span>Tải trọng sàn</span>
                  <span className="text-on-surface">{t.floorLoadTonPerM2} tấn/m²</span>
                </div>
              )}
              {t.clearHeightM != null && (
                <div className="flex items-center justify-between">
                  <span>Tĩnh không dưới dầm</span>
                  <span className="text-on-surface">{t.clearHeightM} m</span>
                </div>
              )}
            </div>
            {t.note && <p className="mt-2 border-t border-outline-variant pt-2 text-[11px] text-on-surface-variant">{t.note}</p>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-outline">
        Tải trọng sàn sẽ bổ sung khi có số liệu kết cấu chi tiết từng hạng mục (hồ sơ hiện có chưa
        nêu tới cấp độ này).
      </p>
    </div>
  )
}
