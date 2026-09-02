import { PackageCheck, PackageOpen } from 'lucide-react'
import { procurementBatches } from '../../data/quantities'
import { Badge } from '../../components/common/Badge'
import { formatDate } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { procurementStatusLabel } from '../../i18n/enumLabels'

export function ProcurementBatches() {
  const { language, tr } = useLanguage()
  return (
    <div className="panel p-4">
      <p className="mb-3 text-sm font-semibold text-on-surface">{tr('Bóc khối lượng phục vụ mua sắm', 'Quantity takeoff for procurement')}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {procurementBatches.map((b) => {
          const Icon = b.status === 'Đã phát hành' ? PackageCheck : PackageOpen
          return (
            <div key={b.id} className="border border-outline-variant bg-surface-container-low p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center bg-brand/15 text-brand">
                  <Icon size={16} />
                </div>
                <Badge tone={b.status === 'Đã phát hành' ? 'success' : 'warning'}>{procurementStatusLabel(b.status, language)}</Badge>
              </div>
              <p className="text-sm font-medium text-on-surface">{language === 'en' ? b.materialGroupEn : b.materialGroup}</p>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                {language === 'en' ? b.quantitySummaryEn : b.quantitySummary}
              </p>
              <p className="mt-2 text-[11px] text-outline">
                {tr('Ngày phát hành', 'Release date')}: {formatDate(b.releaseDate)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
