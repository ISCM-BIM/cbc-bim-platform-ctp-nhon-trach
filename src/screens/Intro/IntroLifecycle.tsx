import { Boxes, GitMerge, CalendarClock, Calculator, History, Settings, Globe2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppView } from '../../types'
import { useLanguage } from '../../i18n/LanguageContext'

interface Stage {
  icon: LucideIcon
  label: string
  labelEn: string
  description: string
  descriptionEn: string
  target: AppView
}

const STAGES: Stage[] = [
  { icon: Boxes, label: '3D — Mô hình', labelEn: '3D — Model', description: 'Dựng mô hình thông tin cho từng bộ môn', descriptionEn: 'Build the information model for each discipline', target: 'model3d' },
  { icon: GitMerge, label: 'Phối hợp', labelEn: 'Coordination', description: 'Gộp mô hình, phát hiện và xử lý xung đột trước khi thi công', descriptionEn: 'Federate models, detect and resolve clashes before construction', target: 'clash' },
  { icon: CalendarClock, label: '4D — Tiến độ', labelEn: '4D — Schedule', description: 'Gắn thời gian vào cấu kiện, mô phỏng trình tự thi công', descriptionEn: 'Link time to elements, simulate the construction sequence', target: 'schedule' },
  { icon: Calculator, label: '5D — Chi phí', labelEn: '5D — Cost', description: 'Bóc khối lượng từ mô hình, kiểm soát chi phí minh bạch', descriptionEn: 'Take off quantities from the model for transparent cost control', target: 'quantity' },
  { icon: History, label: 'Hoàn công', labelEn: 'As-Built', description: 'Cập nhật thay đổi hiện trường, mô hình phản ánh đúng thực tế', descriptionEn: 'Capture field changes so the model reflects reality', target: 'asbuilt' },
  { icon: Settings, label: '6D/7D — Vận hành', labelEn: '6D/7D — Operations', description: 'Bàn giao dữ liệu tài sản phục vụ vận hành, bảo trì', descriptionEn: 'Hand over asset data for operations and maintenance', target: 'assets' },
  { icon: Globe2, label: 'Digital Twin', labelEn: 'Digital Twin', description: 'Ghép dữ liệu công trình vào bản sao số đô thị', descriptionEn: 'Merge building data into the urban digital twin', target: 'dashboard' },
]

interface IntroLifecycleProps {
  onNavigate: (view: AppView) => void
}

export function IntroLifecycle({ onNavigate }: IntroLifecycleProps) {
  const { language, tr } = useLanguage()
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <h2 className="mb-3 text-center font-heading text-2xl font-bold text-on-surface md:text-3xl">
        {tr('Vòng đời thông tin công trình', 'Building information lifecycle')}
      </h2>
      <p className="mb-12 text-center text-sm text-on-surface-variant">{tr('Bấm vào một chặng để xem trực tiếp trên nền tảng', 'Click a stage to see it live on the platform')}</p>

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
              <p className="font-heading text-xs font-semibold text-on-surface">{language === 'en' ? s.labelEn : s.label}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">{language === 'en' ? s.descriptionEn : s.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
