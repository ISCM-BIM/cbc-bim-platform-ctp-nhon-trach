import { MapPin, Building2, Ruler } from 'lucide-react'
import {
  PROJECT_NAME,
  PROJECT_ADDRESS,
  PROJECT_INVESTOR,
  TOTAL_LAND_AREA_M2,
  TOTAL_BUILDING_FOOTPRINT_M2,
  TOTAL_FLOOR_AREA_M2,
  FLOOR_AREA_RATIO,
} from '../../data/constants'
import { formatNumber } from '../../utils/format'

// "Bảng cân bằng sử dụng đất" thật (hồ sơ thiết kế kỹ thuật, trang Tổng mặt bằng) - 4 nhóm A-D
// đúng tên/tỷ lệ gốc, cộng lại khớp đúng TOTAL_LAND_AREA_M2 = 115.328 m². Nhóm A (công trình
// chính) là hạng mục duy nhất tính vào mật độ xây dựng (57,33%, trần cho phép ≤70%).
const LAND_USE = [
  { label: 'Công trình chính (tính mật độ XD)', areaM2: 66_120.37, percent: 57.33 },
  { label: 'Công trình phụ trợ - hạ tầng KT', areaM2: 989.1, percent: 0.86 },
  { label: 'Cây xanh cảnh quan', areaM2: 23_122.21, percent: 20.05 },
  { label: 'Giao thông - sân bãi', areaM2: 25_096.32, percent: 21.76 },
]

export function ProjectInfoPanel() {
  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-brand">Thông tin dự án</p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-on-surface">{PROJECT_NAME}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <MapPin size={14} /> {PROJECT_ADDRESS}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
            <span>
              Chủ đầu tư: <span className="font-medium text-on-surface">{PROJECT_INVESTOR}</span>
            </span>
            <span>
              Nhà thầu thi công: <span className="font-medium text-on-surface">CBC</span>
            </span>
            <span>
              Tư vấn triển khai BIM: <span className="font-medium text-on-surface">ISCM–UEH</span>
            </span>
          </div>
        </div>

        <div className="flex gap-5 text-right">
          <div>
            <p className="flex items-center justify-end gap-1.5 text-[11px] text-on-surface-variant">
              <Ruler size={12} /> Tổng diện tích đất
            </p>
            <p className="font-heading text-lg font-semibold text-on-surface">{formatNumber(TOTAL_LAND_AREA_M2)} m²</p>
          </div>
          <div>
            <p className="flex items-center justify-end gap-1.5 text-[11px] text-on-surface-variant">
              <Building2 size={12} /> Diện tích sàn xây dựng
            </p>
            <p className="font-heading text-lg font-semibold text-on-surface">{formatNumber(TOTAL_FLOOR_AREA_M2)} m²</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant pt-4 sm:grid-cols-4">
        {LAND_USE.map((l) => (
          <div key={l.label}>
            <p className="text-[11px] text-on-surface-variant">{l.label}</p>
            <p className="text-sm font-semibold text-on-surface">
              {formatNumber(l.areaM2)} m² <span className="font-normal text-on-surface-variant">({l.percent}%)</span>
            </p>
          </div>
        ))}
        <div>
          <p className="text-[11px] text-on-surface-variant">Diện tích xây dựng (footprint)</p>
          <p className="text-sm font-semibold text-on-surface">{formatNumber(TOTAL_BUILDING_FOOTPRINT_M2)} m²</p>
        </div>
        <div>
          <p className="text-[11px] text-on-surface-variant">Hệ số sử dụng đất (FAR)</p>
          <p className="text-sm font-semibold text-on-surface">{FLOOR_AREA_RATIO}</p>
        </div>
      </div>
    </div>
  )
}
