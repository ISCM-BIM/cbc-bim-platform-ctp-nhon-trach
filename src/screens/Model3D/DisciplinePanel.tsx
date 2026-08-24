import { Layers, ScissorsLineDashed, Check } from 'lucide-react'
import type { BlockId, Discipline } from '../../types'
import { BLOCKS, DISCIPLINE_COLORS, DISCIPLINES } from '../../data/constants'

interface DisciplinePanelProps {
  visible: Record<Discipline, boolean>
  onToggle: (discipline: Discipline) => void
  selectedBlock: BlockId | 'all'
  onSelectBlock: (block: BlockId | 'all') => void
  cutEnabled: boolean
  onToggleCut: () => void
  cutPosition: number
  onCutPositionChange: (v: number) => void
}

export function DisciplinePanel({
  visible,
  onToggle,
  selectedBlock,
  onSelectBlock,
  cutEnabled,
  onToggleCut,
  cutPosition,
  onCutPositionChange,
}: DisciplinePanelProps) {
  return (
    <aside className="panel flex w-64 shrink-0 flex-col gap-5 overflow-y-auto p-4">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <Layers size={13} /> Chọn block
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectBlock('all')}
            className={` px-2 py-1.5 text-xs font-medium transition-colors ${
              selectedBlock === 'all'
                ? 'bg-brand text-white'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tất cả
          </button>
          {BLOCKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBlock(b.id)}
              className={` px-2 py-1.5 text-xs font-medium transition-colors ${
                selectedBlock === b.id
                  ? 'bg-brand text-white'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {b.id}
            </button>
          ))}
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
              <input
                type="checkbox"
                checked={visible[d]}
                onChange={() => onToggle(d)}
                className="sr-only"
              />
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center border"
                style={{
                  borderColor: DISCIPLINE_COLORS[d],
                  backgroundColor: visible[d] ? DISCIPLINE_COLORS[d] : 'transparent',
                }}
              >
                {visible[d] && <Check size={11} strokeWidth={3} className="text-on-surface" />}
              </span>
              {d}
            </label>
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
            min={0}
            max={270}
            step={1}
            value={cutPosition}
            onChange={(e) => onCutPositionChange(Number(e.target.value))}
            className="w-full accent-brand"
          />
        )}
      </div>

      <div className="mt-auto space-y-1.5 border-t border-outline-variant pt-3 text-[11px] leading-relaxed text-on-surface-variant">
        <p>Chuột trái: xoay · Cuộn: phóng to/thu nhỏ</p>
        <p>Chuột phải kéo: di chuyển góc nhìn</p>
        <p>Bấm marker đỏ để xem chi tiết xung đột</p>
      </div>
    </aside>
  )
}
