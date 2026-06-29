// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect('/auth/login')
  if (session.isSuperAdmin) redirect('/superadmin')

  // Obtener datos frescos de empresa y usuario
  const [empresa, usuario] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id: session.empresaId },
      select: {
        id: true, nombre: true, slug: true, estado: true,
        trialEndsAt: true, colorPrimario: true, logo: true,
      },
    }),
    prisma.usuario.findUnique({
      where: { id: session.sub },
      select: { id: true, nombre: true, email: true, rol: true, avatar: true },
    }),
  ])

  if (!empresa || !usuario) redirect('/auth/login')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        empresa={{
          nombre: empresa.nombre,
          slug: empresa.slug,
          estado: empresa.estado,
          trialEndsAt: empresa.trialEndsAt,
        }}
        usuario={{
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        }}
      />

      {/* Contenido principal */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: '260px' }}
      >
        {children}
      </main>
    </div>
  )
}
