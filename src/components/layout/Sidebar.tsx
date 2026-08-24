import {
  LayoutDashboard,
  Box,
  Boxes,
  CalendarRange,
  Calculator,
  AlertTriangle,
  History,
  Package,
  type LucideIcon,
} from 'lucide-react'
import type { ScreenId } from '../../types'
import { SCREEN_LABELS } from '../../data/roles'
import { useRole } from '../../context/RoleContext'
import iscmShorten from '../../assets/logos/iscm_shorten.png'

const NAV_ICONS: Record<ScreenId, LucideIcon> = {
  dashboard: LayoutDashboard,
  model3d: Box,
  autodesk: Boxes,
  schedule: CalendarRange,
  quantity: Calculator,
  clash: AlertTriangle,
  asbuilt: History,
  assets: Package,
}

interface SidebarProps {
  active: ScreenId
  onNavigate: (screen: ScreenId) => void
  onLogoClick: () => void
}

export function Sidebar({ active, onNavigate, onLogoClick }: SidebarProps) {
  const { permissions } = useRole()

  return (
    <aside className="panel-navy flex h-full w-64 shrink-0 flex-col">
      <button
        type="button"
        onClick={onLogoClick}
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5 text-left transition-colors duration-150 hover:bg-white/5"
        title="Về màn hình giới thiệu"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-white">
          <img src={iscmShorten} alt="ISCM" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-white/92">BIM Monitoring</p>
          <p className="truncate text-xs text-white/50">ISCM–UEH × CBC</p>
        </div>
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {permissions.visibleScreens.map((screen) => {
          const Icon = NAV_ICONS[screen]
          const isActive = screen === active
          return (
            <button
              key={screen}
              type="button"
              onClick={() => onNavigate(screen)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="truncate">{SCREEN_LABELS[screen]}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
