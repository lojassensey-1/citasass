// src/app/superadmin/page.tsx
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Building2, Users, CalendarCheck, TrendingUp, Activity, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { SuperAdminStatsChart } from '@/components/superadmin/SuperAdminStatsChart'

export const dynamic = 'force-dynamic'

export default async function SuperAdminPage() {
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const [
    totalEmpresas,
    empresasActivas,
    empresasTrial,
    empresasSuspendidas,
    empresasVencidas,
    nuevasMes,
    totalUsuarios,
    totalCitas,
    citasMes,
    ultimasEmpresas,
  ] = await Promise.all([
    prisma.empresa.count({ where: { slug: { not: '__sistema__' } } }),
    prisma.empresa.count({ where: { estado: 'ACTIVA' } }),
    prisma.empresa.count({ where: { estado: 'TRIAL' } }),
    prisma.empresa.count({ where: { estado: 'SUSPENDIDA' } }),
    prisma.empresa.count({ where: { estado: 'VENCIDA' } }),
    prisma.empresa.count({ where: { createdAt: { gte: inicioMes }, slug: { not: '__sistema__' } } }),
    prisma.usuario.count({ where: { isSuperAdmin: false } }),
    prisma.cita.count(),
    prisma.cita.count({ where: { createdAt: { gte: inicioMes } } }),
    prisma.empresa.findMany({
      where: { slug: { not: '__sistema__' } },
      include: { plan: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Crecimiento últimos 6 meses
  const crecimiento = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1)
      const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i) + 1, 0)
      const total = await prisma.empresa.count({
        where: { createdAt: { gte: fecha, lte: fechaFin }, slug: { not: '__sistema__' } },
      })
      return {
        mes: fecha.toLocaleString('es', { month: 'short' }),
        empresas: total,
      }
    })
  )

  const kpis = [
    { label: 'Empresas totales', value: totalEmpresas, icon: Building2, color: '#4f67ff', bg: 'rgba(79,103,255,0.1)', sub: `+${nuevasMes} este mes` },
    { label: 'Activas',          value: empresasActivas, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', sub: 'Suscripción activa' },
    { label: 'En prueba',        value: empresasTrial, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', sub: 'Período trial' },
    { label: 'Suspendidas',      value: empresasSuspendidas + empresasVencidas, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', sub: 'Requieren atención' },
    { label: 'Usuarios totales', value: totalUsuarios, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', sub: 'En todas las empresas' },
    { label: 'Citas este mes',   value: citasMes, icon: CalendarCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', sub: `${totalCitas} total histórico` },
  ]

  const estadoConfig: Record<string, { label: string; cls: string }> = {
    TRIAL:      { label: 'Trial',      cls: 'badge-yellow' },
    ACTIVA:     { label: 'Activa',     cls: 'badge-green'  },
    SUSPENDIDA: { label: 'Suspendida', cls: 'badge-red'    },
    VENCIDA:    { label: 'Vencida',    cls: 'badge-gray'   },
    CANCELADA:  { label: 'Cancelada',  cls: 'badge-gray'   },
  }

  return (
    <>
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Panel general</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Vista general del sistema CitaSaaS
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="card p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Gráfico + Últimas empresas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Crecimiento de empresas
            </h3>
            <SuperAdminStatsChart data={crecimiento} />
          </div>

          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Últimas empresas</h3>
              <a href="/superadmin/empresas" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>Ver todas →</a>
            </div>
            <div className="space-y-3">
              {ultimasEmpresas.map((emp) => {
                const cfg = estadoConfig[emp.estado] || estadoConfig['TRIAL']
                return (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--brand)' }}>
                      {emp.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{emp.nombre}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{emp.plan?.nombre || 'Sin plan'}</p>
                    </div>
                    <span className={cfg.cls}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
