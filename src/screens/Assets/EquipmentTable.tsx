import type { Equipment } from '../../types'
import { formatDate } from '../../utils/format'

interface EquipmentTableProps {
  items: Equipment[]
  selectedId: string | null
  onSelect: (item: Equipment) => void
}

export function EquipmentTable({ items, selectedId, onSelect }: EquipmentTableProps) {
  return (
    <div className="shrink-0 overflow-hidden panel">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-surface-container-lowest text-on-surface-variant">
            <tr>
              <th className="px-3 py-2.5 font-medium">Mã</th>
              <th className="px-3 py-2.5 font-medium">Tên thiết bị</th>
              <th className="px-3 py-2.5 font-medium">Hệ thống</th>
              <th className="px-3 py-2.5 font-medium">Vị trí</th>
              <th className="px-3 py-2.5 font-medium">Hãng SX</th>
              <th className="px-3 py-2.5 font-medium">Model</th>
              <th className="px-3 py-2.5 font-medium">Ngày lắp đặt</th>
              <th className="px-3 py-2.5 font-medium">Hạn bảo hành</th>
            </tr>
          </thead>
          <tbody>
            {items.map((eq) => (
              <tr
                key={eq.id}
                onClick={() => onSelect(eq)}
                className={`cursor-pointer border-t border-outline-variant text-on-surface-variant hover:bg-surface-container-lowest/60 ${
                  selectedId === eq.id ? 'bg-brand/10' : ''
                }`}
              >
                <td className="px-3 py-2.5 font-mono text-on-surface-variant">{eq.id}</td>
                <td className="max-w-xs truncate px-3 py-2.5 font-medium text-on-surface" title={eq.name}>
                  {eq.name}
                </td>
                <td className="px-3 py-2.5">{eq.system}</td>
                <td className="px-3 py-2.5 text-on-surface-variant">{eq.location}</td>
                <td className="px-3 py-2.5">{eq.manufacturer}</td>
                <td className="px-3 py-2.5 font-mono text-on-surface-variant">{eq.model}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-on-surface-variant">{formatDate(eq.installDate)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-on-surface-variant">{formatDate(eq.warrantyUntil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-on-surface-variant">Không có thiết bị phù hợp bộ lọc.</p>
        )}
      </div>
    </div>
  )
}
