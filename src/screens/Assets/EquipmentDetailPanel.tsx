import type { ReactNode } from 'react'
import { X, FileText, Wrench, MapPin, Calendar, ShieldCheck } from 'lucide-react'
import type { Equipment } from '../../types'
import { formatDate } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'
import { equipmentSystemLabel } from '../../i18n/enumLabels'

interface EquipmentDetailPanelProps {
  equipment: Equipment
  onClose: () => void
}

export function EquipmentDetailPanel({ equipment, onClose }: EquipmentDetailPanelProps) {
  const { language, tr } = useLanguage()
  return (
    <div className="panel flex h-full w-96 shrink-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-on-surface-variant">{equipment.id}</span>
          <p className="text-sm font-semibold text-on-surface">{equipment.name}</p>
        </div>
        <button type="button" onClick={onClose} className="p-0.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-1.5 border border-outline-variant bg-surface-container-lowest p-3 text-xs text-on-surface-variant">
        <Row label={tr('Hệ thống', 'System')} value={equipmentSystemLabel(equipment.system, language)} />
        <Row label={tr('Vị trí', 'Location')} value={equipment.location} icon={<MapPin size={12} />} />
        <Row label={tr('Hãng sản xuất', 'Manufacturer')} value={equipment.manufacturer} />
        <Row label="Model" value={equipment.model} mono />
        <Row label={tr('Công suất / thông số', 'Capacity / specs')} value={equipment.capacity} />
        <Row label={tr('Ngày lắp đặt', 'Install date')} value={formatDate(equipment.installDate)} icon={<Calendar size={12} />} />
        <Row label={tr('Hạn bảo hành', 'Warranty until')} value={formatDate(equipment.warrantyUntil)} icon={<ShieldCheck size={12} />} />
        <Row label={tr('Chu kỳ bảo trì', 'Maintenance cycle')} value={`${equipment.maintenanceCycleMonths} ${tr('tháng', 'months')}`} icon={<Wrench size={12} />} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">{tr('Lịch bảo trì 12 tháng tới', 'Maintenance schedule for the next 12 months')}</p>
        <div className="space-y-1.5">
          {equipment.upcomingMaintenance.map((m, i) => (
            <div key={i} className="flex items-center justify-between border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs">
              <span className="text-on-surface-variant">{m.task}</span>
              <span className="text-on-surface-variant">{formatDate(m.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <p className="mb-2 text-xs font-semibold text-on-surface-variant">{tr('Tài liệu đính kèm', 'Attached documents')}</p>
        <div className="space-y-1.5">
          {equipment.documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs text-on-surface-variant">
              <FileText size={13} className="shrink-0 text-on-surface-variant" />
              <span className="truncate">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, icon, mono }: { label: string; value: string; icon?: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-on-surface-variant">
        {icon}
        {label}
      </span>
      <span className={`text-right text-on-surface ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
