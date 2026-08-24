import { PlayCircle, Play, Pause, HardHat } from 'lucide-react'

interface MonthSliderProps {
  month: number
  onChange: (month: number) => void
  min: number
  max: number
  /** Nhãn dòng tiêu đề, vd. "Tiến độ thi công (mô phỏng 4D)" hoặc "...(suy luận tự động)". */
  title: string
  /** Chuỗi hiển thị bên phải cho giá trị tháng hiện tại, vd. "Tháng 4/9 · Th12/2026". */
  formatLabel: (month: number) => string
  /** Nhãn ngắn dưới mỗi mốc trên thanh trượt, vd. (m) => `T${m}`. */
  formatMark: (month: number) => string
  /** Vị trí các mốc hiện tick - mặc định chia đều theo số nguyên (min, min+1, ..., max). Truyền
   * riêng khi khoảng cách đều theo chỉ số "tháng" không khớp với ranh giới tháng dương lịch thật
   * (vd quy đổi tháng~30.44 ngày có thể khiến 2 mốc liền kề rơi cùng 1 tháng dương lịch, gây nhãn
   * trùng nhau - xem Model3D.tsx). */
  marks?: number[]
  isPlaying: boolean
  onTogglePlay: () => void
  /** "Đang thi công: <tầng> · <hạng mục>" tại đúng thời điểm month - null nếu chưa có dữ liệu. */
  activityLabel?: string | null
  /** Tốc độ chạy tự động hiện tại (hệ số nhân, vd 1 = mặc định, 2 = nhanh gấp đôi). */
  playbackSpeed: number
  onChangeSpeed: (speed: number) => void
  speedOptions: number[]
}

export function MonthSlider({
  month,
  onChange,
  min,
  max,
  title,
  formatLabel,
  formatMark,
  marks: marksProp,
  isPlaying,
  onTogglePlay,
  activityLabel,
  playbackSpeed,
  onChangeSpeed,
  speedOptions,
}: MonthSliderProps) {
  const marks = marksProp ?? Array.from({ length: Math.max(2, Math.round(max - min) + 1) }, (_, i) => min + i)

  return (
    <div className="panel shrink-0 px-6 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          <PlayCircle size={13} /> {title}
        </p>
        <p className="text-sm font-semibold text-brand">{formatLabel(month)}</p>
      </div>

      {activityLabel && (
        <p className="mb-2 flex items-center gap-1.5 text-xs text-on-surface">
          <HardHat size={13} className="shrink-0 text-brand" />
          Đang thi công: <span className="font-semibold">{activityLabel}</span>
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Tạm dừng' : 'Chạy tự động'}
          title={isPlaying ? 'Tạm dừng' : 'Chạy tự động tiến độ thi công'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/90"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="flex shrink-0 items-center" title="Tốc độ chạy tự động">
          {speedOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeSpeed(s)}
              aria-label={`Tốc độ ${s}x`}
              className={`px-1.5 py-1 text-[10px] font-semibold transition-colors ${
                s === playbackSpeed
                  ? 'bg-brand text-white'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={(max - min) / 200 || 0.05}
            value={month}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <div className="mt-1 flex justify-between px-0.5 text-[10px] text-outline">
            {marks.map((m) => (
              <span key={m}>{formatMark(m)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
