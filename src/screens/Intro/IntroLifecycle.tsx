import { Boxes, GitMerge, CalendarClock, Calculator, History, Settings, Globe2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppView } from '../../types'

interface Stage {
  icon: LucideIcon
  label: string
  description: string
  target: AppView
}

const STAGES: Stage[] = [
  { icon: Boxes, label: '3D — Mô hình', description: 'Dựng mô hình thông tin cho từng bộ môn', target: 'model3d' },
  { icon: GitMerge, label: 'Phối hợp', description: 'Gộp mô hình, phát hiện và xử lý xung đột trước khi thi công', target: 'clash' },
  { icon: CalendarClock, label: '4D — Tiến độ', description: 'Gắn thời gian vào cấu kiện, mô phỏng trình tự thi công', target: 'schedule' },
  { icon: Calculator, label: '5D — Chi phí', description: 'Bóc khối lượng từ mô hình, kiểm soát chi phí minh bạch', target: 'quantity' },
  { icon: History, label: 'Hoàn công', description: 'Cập nhật thay đổi hiện trường, mô hình phản ánh đúng thực tế', target: 'asbuilt' },
  { icon: Settings, label: '6D/7D — Vận hành', description: 'Bàn giao dữ liệu tài sản phục vụ vận hành, bảo trì', target: 'assets' },
  { icon: Globe2, label: 'Digital Twin', description: 'Ghép dữ liệu công trình vào bản sao số đô thị', target: 'dashboard' },
]

interface IntroLifecycleProps {
  onNavigate: (view: AppView) => void
}

export function IntroLifecycle({ onNavigate }: IntroLifecycleProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <h2 className="mb-3 text-center font-heading text-2xl font-bold text-on-surface md:text-3xl">
        Vòng đời thông tin công trình
      </h2>
      <p className="mb-12 text-center text-sm text-on-surface-variant">Bấm vào một chặng để xem trực tiếp trên nền tảng</p>

      <div className="relative">
        <div className="lifecycle-line absolute left-0 right-0 top-9 hidden h-px md:block" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7 md:gap-3">
          {STAGES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onNavigate(s.target)}
              className="panel panel-hover group relative flex flex-col items-center p-4 text-center"
            >
              <span className="absolute right-2 top-2 font-heading text-[10px] font-semibold text-outline">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand transition-transform duration-200 group-hover:scale-110">
                <s.icon size={18} />
              </div>
              <p className="font-heading text-xs font-semibold text-on-surface">{s.label}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">{s.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
