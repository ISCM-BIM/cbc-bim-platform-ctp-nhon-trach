import { lazy, Suspense, useEffect, useState } from 'react'
import type { AppView, Discipline, ScreenId } from './types'
import { RoleProvider, useRole } from './context/RoleContext'
import { AppShell } from './components/layout/AppShell'
import { Intro } from './screens/Intro/Intro'
import { Dashboard } from './screens/Dashboard/Dashboard'
import type { Model3DFocus } from './screens/Model3D/Model3D'
import { AutodeskViewer } from './screens/Autodesk/AutodeskViewer'
import { Schedule } from './screens/Schedule/Schedule'
import { Quantity } from './screens/Quantity/Quantity'
import { Clash } from './screens/Clash/Clash'
import { AsBuilt } from './screens/AsBuilt/AsBuilt'
import { Assets } from './screens/Assets/Assets'

// Model3D (và toàn bộ src/ifc/* + engine WASM web-ifc nó kéo theo) tách thành chunk riêng,
// chỉ tải khi người dùng thực sự vào tab Mô hình 3D - engine đọc IFC khá nặng (~100-150KB
// nén gzip chỉ riêng JS loader của web-ifc, chưa kể .wasm tải riêng), không cần bắt mọi màn
// hình khác (Dashboard, Tổng quan...) phải tải kèm nếu người dùng không bao giờ mở tab này.
const Model3D = lazy(() => import('./screens/Model3D/Model3D').then((m) => ({ default: m.Model3D })))

function Shell() {
  const [view, setView] = useState<AppView>('intro')
  const [model3DFocus, setModel3DFocus] = useState<Model3DFocus | null>(null)
  const { permissions } = useRole()

  useEffect(() => {
    if (view !== 'intro' && !permissions.visibleScreens.includes(view)) {
      setView('dashboard')
    }
  }, [permissions, view])

  if (view === 'intro') {
    return <Intro onNavigate={setView} />
  }

  const active = view as ScreenId

  const goToModel3D = (discipline: Discipline) => {
    setModel3DFocus({ discipline })
    setView('model3d')
  }

  return (
    <AppShell active={active} onNavigate={setView} onLogoClick={() => setView('intro')}>
      {active === 'dashboard' && <Dashboard />}
      {active === 'model3d' && (
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-on-surface-variant">Đang tải màn hình Mô hình 3D...</div>}>
          <Model3D focus={model3DFocus} />
        </Suspense>
      )}
      {active === 'autodesk' && <AutodeskViewer />}
      {active === 'schedule' && <Schedule />}
      {active === 'quantity' && <Quantity onViewOn3D={goToModel3D} />}
      {active === 'clash' && <Clash />}
      {active === 'asbuilt' && <AsBuilt />}
      {active === 'assets' && <Assets />}
    </AppShell>
  )
}

function App() {
  return (
    <RoleProvider>
      <Shell />
    </RoleProvider>
  )
}

export default App
