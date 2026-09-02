import { Ruler, Layers } from 'lucide-react'
import { tenantInfo } from '../../data/tenantInfo'
import { BLOCKS } from '../../data/constants'
import { formatNumber } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

export function TenantInfoPanel() {
  const { language, tr } = useLanguage()
  const blockName = (id: string) => {
    const b = BLOCKS.find((b) => b.id === id)
    if (!b) return id
    return language === 'en' ? (b.nameEn ?? b.name) : b.name
  }
  const totalArea = tenantInfo.reduce((sum, t) => sum + t.areaM2, 0)

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">{tr('Thông số hạng mục công trình', 'Facility specifications')}</p>
        <p className="text-xs text-on-surface-variant">
          {tenantInfo.length} {tr('hạng mục', 'items')} · {formatNumber(Math.round(totalArea))} m²
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
                  <Ruler size={12} /> {tr('Diện tích', 'Area')}
                </span>
                <span className="text-on-surface">{formatNumber(t.areaM2)} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={12} /> {tr('Số tầng', 'Storeys')}
                </span>
                <span className="text-on-surface">{t.storeys}</span>
              </div>
              {t.floorLoadTonPerM2 != null && (
                <div className="flex items-center justify-between">
                  <span>{tr('Tải trọng sàn', 'Floor load')}</span>
                  <span className="text-on-surface">{t.floorLoadTonPerM2} {tr('tấn/m²', 'ton/m²')}</span>
                </div>
              )}
              {t.clearHeightM != null && (
                <div className="flex items-center justify-between">
                  <span>{tr('Tĩnh không dưới dầm', 'Clear height under beam')}</span>
                  <span className="text-on-surface">{t.clearHeightM} m</span>
                </div>
              )}
            </div>
            {t.note && <p className="mt-2 border-t border-outline-variant pt-2 text-[11px] text-on-surface-variant">{t.note}</p>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-outline">
        {tr(
          'Tải trọng sàn sẽ bổ sung khi có số liệu kết cấu chi tiết từng hạng mục (hồ sơ hiện có chưa nêu tới cấp độ này).',
          'Floor load data will be added once detailed structural figures per facility are available (the current documentation does not go to that level of detail).',
        )}
      </p>
    </div>
  )
}
