import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RolePermissions, UserRole } from '../types'
import { ROLE_PERMISSIONS } from '../data/roles'

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  permissions: RolePermissions
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('contractor')
  const value = useMemo<RoleContextValue>(
    () => ({ role, setRole, permissions: ROLE_PERMISSIONS[role] }),
    [role],
  )
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole phải được dùng bên trong RoleProvider')
  return ctx
}
