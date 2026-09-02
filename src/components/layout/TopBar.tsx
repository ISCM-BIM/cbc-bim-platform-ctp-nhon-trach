import type { ScreenId, UserRole } from '../../types'
import { ROLE_LABELS, ROLE_LABELS_EN, ROLE_ORDER, SCREEN_LABELS, SCREEN_LABELS_EN } from '../../data/roles'
import { useRole } from '../../context/RoleContext'
import { useLiveMinutesAgo } from '../../hooks/useLiveMinutesAgo'
import { PLATFORM_TITLE, PLATFORM_TITLE_EN } from '../../data/constants'
import { useLanguage, pick, type Language } from '../../i18n/LanguageContext'

interface TopBarProps {
  active: ScreenId
}

export function TopBar({ active }: TopBarProps) {
  const { role, setRole } = useRole()
  const { language, setLanguage, tr } = useLanguage()
  const minutesAgo = useLiveMinutesAgo()

  return (
    <header className="panel-navy flex h-20 shrink-0 items-center justify-between px-6">
      <div className="min-w-0">
        <p className="label-caps text-brand-tint-1">{pick(SCREEN_LABELS, SCREEN_LABELS_EN, active, language)}</p>
        <h1 className="truncate font-heading text-base font-semibold text-white/92">
          {language === 'en' ? PLATFORM_TITLE_EN : PLATFORM_TITLE}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          {/* Chấm "đang live": dùng xanh tươi cố định (không dùng token status-success vì
              token đó đã tối màu để đọc được trên nền trắng - trên nền Navy của TopBar cần
              màu sáng hơn hẳn mới đủ tương phản). */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          </span>
          <span>
            {tr('Cập nhật lần cuối', 'Last updated')}: {minutesAgo} {tr('phút trước', language === 'en' && minutesAgo === 1 ? 'minute ago' : 'minutes ago')}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1 border border-white/10 bg-white/5 p-1">
          {ROLE_ORDER.map((r) => (
            <RoleButton key={r} role={r} active={role === r} language={language} onClick={() => setRole(r)} />
          ))}
        </div>

        {/* Nút chuyển ngôn ngữ - LUÔN ở góc phải trên cùng (yêu cầu người dùng 2026-09-02), mặc
            định tiếng Việt mỗi lần tải lại trang (xem LanguageProvider - không lưu localStorage). */}
        <div
          className="flex shrink-0 items-center gap-1 border border-white/10 bg-white/5 p-1"
          title={tr('Chuyển sang tiếng Anh', 'Switch to Vietnamese')}
        >
          <LanguageButton label="VI" active={language === 'vi'} onClick={() => setLanguage('vi')} />
          <LanguageButton label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
        </div>
      </div>
    </header>
  )
}

function RoleButton({
  role,
  active,
  language,
  onClick,
}: {
  role: UserRole
  active: boolean
  language: Language
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
        active ? 'pop-shadow bg-brand text-white' : 'text-white/60 hover:text-white/90'
      }`}
    >
      {pick(ROLE_LABELS, ROLE_LABELS_EN, role, language)}
    </button>
  )
}

function LanguageButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
        active ? 'pop-shadow bg-brand text-white' : 'text-white/60 hover:text-white/90'
      }`}
    >
      {label}
    </button>
  )
}
