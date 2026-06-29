// src/app/superadmin/layout.tsx
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireSuperAdmin()
  } catch {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <SuperAdminSidebar />
      <main className="flex-1 flex flex-col" style={{ marginLeft: '260px' }}>
        {children}
      </main>
    </div>
  )
}
