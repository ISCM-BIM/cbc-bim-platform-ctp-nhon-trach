import type { ScreenId, UserRole } from '../../types'
import { ROLE_LABELS, ROLE_ORDER, SCREEN_LABELS } from '../../data/roles'
import { useRole } from '../../context/RoleContext'
import { useLiveMinutesAgo } from '../../hooks/useLiveMinutesAgo'
import { PLATFORM_TITLE } from '../../data/constants'

interface TopBarProps {
  active: ScreenId
}

export function TopBar({ active }: TopBarProps) {
  const { role, setRole } = useRole()
  const minutesAgo = useLiveMinutesAgo()

  return (
    <header className="panel-navy flex h-20 shrink-0 items-center justify-between px-6">
      <div className="min-w-0">
        <p className="label-caps text-brand-tint-1">{SCREEN_LABELS[active]}</p>
        <h1 className="truncate font-heading text-base font-semibold text-white/92">{PLATFORM_TITLE}</h1>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          {/* Chấm "đang live": dùng xanh tươi cố định (không dùng token status-success vì
              token đó đã tối màu để đọc được trên nền trắng - trên nền Navy của TopBar cần
              màu sáng hơn hẳn mới đủ tương phản). */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          </span>
          <span>Cập nhật lần cuối: {minutesAgo} phút trước</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 border border-white/10 bg-white/5 p-1">
        {ROLE_ORDER.map((r) => (
          <RoleButton key={r} role={r} active={role === r} onClick={() => setRole(r)} />
        ))}
      </div>
    </header>
  )
}

function RoleButton({
  role,
  active,
  onClick,
}: {
  role: UserRole
  active: boolean
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
      {ROLE_LABELS[role]}
    </button>
  )
}
