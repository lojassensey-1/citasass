// src/components/dashboard/DashboardStats.tsx
import { CalendarCheck, Clock, UserPlus, Users, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  citasHoy: number
  citasPendientes: number
  clientesNuevosMes: number
  totalClientes: number
  ingresosMes: number
}

export function DashboardStats({
  citasHoy, citasPendientes, clientesNuevosMes, totalClientes, ingresosMes,
}: Props) {
  const stats = [
    {
      label: 'Citas hoy',
      value: String(citasHoy),
      icon: CalendarCheck,
      color: '#4f67ff',
      bg: 'rgba(79,103,255,0.08)',
      sub: `${citasPendientes} pendiente${citasPendientes !== 1 ? 's' : ''}`,
    },
    {
      label: 'Clientes nuevos',
      value: String(clientesNuevosMes),
      icon: UserPlus,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      sub: 'Este mes',
    },
    {
      label: 'Total clientes',
      value: String(totalClientes),
      icon: Users,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
      sub: 'En tu base',
    },
    {
      label: 'Ingresos del mes',
      value: formatCurrency(ingresosMes),
      icon: TrendingUp,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      sub: 'Citas pagadas',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
        <div
          key={label}
          className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: bg }}
            >
              <Icon size={20} style={{ color }} />
            </div>
          </div>
          <div>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
