import type { ReactNode } from 'react'
import type { ScreenId } from '../../types'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  active: ScreenId
  onNavigate: (screen: ScreenId) => void
  onLogoClick: () => void
  children: ReactNode
}

export function AppShell({ active, onNavigate, onLogoClick, children }: AppShellProps) {
  return (
    <div className="flex h-full w-full gap-4 overflow-hidden bg-surface-dim p-4">
      <Sidebar active={active} onNavigate={onNavigate} onLogoClick={onLogoClick} />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <TopBar active={active} />
        <main className="panel min-h-0 flex-1 overflow-y-auto">
          <div key={active} className="animate-fadein h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
