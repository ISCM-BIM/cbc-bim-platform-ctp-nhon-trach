import { Layers, ScissorsLineDashed, Check, Wind } from 'lucide-react'
import type { Discipline } from '../../../types'
import { DISCIPLINE_COLORS, DISCIPLINES } from '../../../data/constants'
import type { IfcStorey } from '../../../ifc/types'
import { PHASE_COLORS, PHASE_LABEL, type ConstructionPhase } from '../../../ifc/constructionPhase'
import { MEP_SYSTEM_COLORS, MEP_SYSTEM_LABEL, MEP_SYSTEM_CATEGORIES, type MepSystemCategory } from '../../../ifc/mepSystem'
import { formatNumber } from '../../../utils/format'

// Thứ tự hiển thị chú giải màu giai đoạn - đúng trình tự thi công thật (khớp SEQUENCE trong
// ifc4d.ts), không lấy trực tiếp Object.keys(PHASE_COLORS) để không phụ thuộc ngầm vào thứ tự
// khai báo object; "khác" đặt cuối vì chỉ là nhóm dự phòng, không phải giai đoạn thật.
const PHASE_LEGEND_ORDER: ConstructionPhase[] = ['coc', 'mong', 'khung', 'san_mai', 'bao_che', 'hoan_thien', 'khac']

interface IfcFilterPanelProps {
  fileName: string
  elementCount: number
  triangleCount: number
  storeys: IfcStorey[]
  visibleStoreys: 'all' | Set<number | null>
  onSelectStoreys: (v: 'all' | Set<number | null>) => void
  visible: Record<Discipline, boolean>
  onToggle: (discipline: Discipline) => void
  /** Số cấu kiện theo hệ MEP thật CÓ MẶT trong model đang mở - chỉ hiện mục lọc cho hệ nào thật
   * sự tồn tại (rỗng = model không có/không tách được hệ MEP, ẩn cả phần này). */
  mepSystemCounts: Partial<Record<MepSystemCategory, number>>
  visibleMepSystems: Record<MepSystemCategory, boolean>
  onToggleMepSystem: (category: MepSystemCategory) => void
  cutEnabled: boolean
  onToggleCut: () => void
  cutPosition: number
  onCutPositionChange: (v: number) => void
  cutRange: number
}

export function IfcFilterPanel({
  fileName,
  elementCount,
  triangleCount,
  storeys,
  visibleStoreys,
  onSelectStoreys,
  visible,
  onToggle,
  mepSystemCounts,
  visibleMepSystems,
  onToggleMepSystem,
  cutEnabled,
  onToggleCut,
  cutPosition,
  onCutPositionChange,
  cutRange,
}: IfcFilterPanelProps) {
  const presentMepSystems = MEP_SYSTEM_CATEGORIES.filter((c) => (mepSystemCounts[c] ?? 0) > 0)
  // "Tất cả" bao gồm cả cấu kiện không gán được vào tầng nào (storeyExpressID = null - hạ
  // tầng/sân bãi thường rơi vào đây) - phải liệt kê rõ null trong tập đầy đủ, nếu không lần
  // đầu bỏ chọn 1 tầng sẽ làm nhóm "chưa gán tầng" biến mất vĩnh viễn khỏi bộ lọc.
  const allIds: (number | null)[] = [...storeys.map((s) => s.expressID), null]
  const isStoreySelected = (id: number | null) => visibleStoreys === 'all' || visibleStoreys.has(id)
  const toggleStorey = (id: number | null) => {
    if (visibleStoreys === 'all') {
      onSelectStoreys(new Set(allIds.filter((x) => x !== id)))
      return
    }
    const next = new Set(visibleStoreys)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectStoreys(next.size === allIds.length ? 'all' : next)
  }

  return (
    <aside className="panel flex w-64 shrink-0 flex-col gap-5 overflow-y-auto p-4">
      <div className="border-b border-outline-variant pb-3">
        <p className="truncate text-sm font-semibold text-on-surface" title={fileName}>
          {fileName}
        </p>
        <p className="mt-0.5 text-[11px] text-on-surface-variant">
          {formatNumber(elementCount)} cấu kiện · {formatNumber(triangleCount)} tam giác
        </p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <Layers size={13} /> Tầng ({storeys.length})
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectStoreys('all')}
            className={`block w-full px-2 py-1.5 text-left text-xs font-medium transition-colors ${
              visibleStoreys === 'all' ? 'bg-brand text-white' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tất cả các tầng
          </button>
          {[...storeys].reverse().map((s) => (
            <button
              key={s.expressID}
              type="button"
              onClick={() => toggleStorey(s.expressID)}
              className={`block w-full px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                isStoreySelected(s.expressID) && visibleStoreys !== 'all'
                  ? 'bg-brand text-white'
                  : visibleStoreys === 'all'
                    ? 'text-on-surface-variant'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s.name}
              {s.elevation != null && <span className="ml-1 opacity-70">· {s.elevation.toFixed(1)}m</span>}
            </button>
          ))}
          <button
            type="button"
            onClick={() => toggleStorey(null)}
            title="Cấu kiện không xác định được tầng chứa (thường là hạ tầng, sân bãi...)"
            className={`block w-full px-2 py-1.5 text-left text-xs font-medium transition-colors ${
              isStoreySelected(null) && visibleStoreys !== 'all'
                ? 'bg-brand text-white'
                : visibleStoreys === 'all'
                  ? 'text-on-surface-variant'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Ngoài tầng (hạ tầng, sân bãi...)
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Bộ môn hiển thị</p>
        <div className="space-y-1.5">
          {DISCIPLINES.map((d) => (
            <label
              key={d}
              className="flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high"
            >
              <input type="checkbox" checked={visible[d]} onChange={() => onToggle(d)} className="sr-only" />
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center border"
                style={{ borderColor: DISCIPLINE_COLORS[d], backgroundColor: visible[d] ? DISCIPLINE_COLORS[d] : 'transparent' }}
              >
                {visible[d] && <Check size={11} strokeWidth={3} className="text-on-surface" />}
              </span>
              {d}
            </label>
          ))}
        </div>
      </div>

      {presentMepSystems.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <Wind size={13} /> Hệ thống MEP
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {presentMepSystems.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-high"
              >
                <input
                  type="checkbox"
                  checked={visibleMepSystems[cat]}
                  onChange={() => onToggleMepSystem(cat)}
                  className="sr-only"
                />
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center border"
                  style={{
                    borderColor: MEP_SYSTEM_COLORS[cat],
                    backgroundColor: visibleMepSystems[cat] ? MEP_SYSTEM_COLORS[cat] : 'transparent',
                  }}
                >
                  {visibleMepSystems[cat] && <Check size={9} strokeWidth={3} className="text-on-surface" />}
                </span>
                <span className="flex-1">{MEP_SYSTEM_LABEL[cat]}</span>
                <span className="text-[10px] opacity-70">{formatNumber(mepSystemCounts[cat] ?? 0)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Màu theo giai đoạn (Kết cấu/Kiến trúc)
        </p>
        {/* Chú giải, không phải bộ lọc - Kết cấu/Kiến trúc tô theo giai đoạn thi công (xem
            IfcModelView.tsx) để phân biệt cọc/móng/khung/sàn/bao che/hoàn thiện rõ hơn là chỉ 2
            màu bộ môn phẳng. MEP/Hạ tầng không chia giai đoạn, giữ nguyên màu ở mục trên. */}
        <div className="space-y-1 text-xs text-on-surface-variant">
          {PHASE_LEGEND_ORDER.map((phase) => (
            <div key={phase} className="flex items-center gap-2.5 px-2.5 py-1">
              <span className="h-3 w-3 shrink-0" style={{ backgroundColor: PHASE_COLORS[phase] }} />
              {PHASE_LABEL[phase]}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <input type="checkbox" checked={cutEnabled} onChange={onToggleCut} className="accent-brand" />
          <ScissorsLineDashed size={13} /> Chế độ cắt mặt cắt
        </label>
        {cutEnabled && (
          <input
            type="range"
            min={-cutRange}
            max={cutRange}
            step={cutRange / 200}
            value={cutPosition}
            onChange={(e) => onCutPositionChange(Number(e.target.value))}
            className="w-full accent-brand"
          />
        )}
      </div>

      <div className="mt-auto space-y-1.5 border-t border-outline-variant pt-3 text-[11px] leading-relaxed text-on-surface-variant">
        <p>Chuột trái: xoay · Cuộn: phóng to/thu nhỏ</p>
        <p>Chuột phải kéo: di chuyển góc nhìn</p>
        <p>Bấm vào cấu kiện để xem thuộc tính IFC</p>
      </div>
    </aside>
  )
}
