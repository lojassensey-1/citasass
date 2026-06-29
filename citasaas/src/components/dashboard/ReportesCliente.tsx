// src/components/dashboard/ReportesCliente.tsx
'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'
import { TrendingUp, CalendarX, DollarSign, PercentCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ReportesData {
  resumen: { citasMes: number; cancelacionesMes: number; tasaCancelacion: number; ingresosMes: number; ingresosAnio: number }
  serviciosTop: { nombre: string; color: string; total: number }[]
  profesionalesTop: { nombre: string; color: string; total: number }[]
  clientesFrecuentes: { nombre: string; total: number }[]
  citasPorEstado: { estado: string; total: number }[]
  ingresosPorMes: { mes: string; ingresos: number }[]
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió',
}
const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: '#f59e0b', CONFIRMADA: '#4f67ff', EN_CURSO: '#8b5cf6',
  COMPLETADA: '#10b981', CANCELADA: '#ef4444', NO_ASISTIO: '#6b7280',
}

export function ReportesCliente({ data }: { data: ReportesData }) {
  const { resumen, serviciosTop, profesionalesTop, clientesFrecuentes, citasPorEstado, ingresosPorMes } = data

  const kpis = [
    { label: 'Citas este mes', value: String(resumen.citasMes), icon: TrendingUp, color: '#4f67ff', bg: 'rgba(79,103,255,0.1)' },
    { label: 'Cancelaciones', value: String(resumen.cancelacionesMes), icon: CalendarX, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', sub: `${resumen.tasaCancelacion}% del total` },
    { label: 'Ingresos del mes', value: formatCurrency(resumen.ingresosMes), icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Ingresos del año', value: formatCurrency(resumen.ingresosAnio), icon: PercentCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="card p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Ingresos por mes */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          Ingresos últimos 6 meses
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ingresosPorMes} margin={{ left: 10, right: 10, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)', textTransform: 'capitalize' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(v: number) => [formatCurrency(v), 'Ingresos']}
            />
            <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fill="url(#gradIngresos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fila: Servicios + Estado citas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios más solicitados */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Servicios más solicitados
          </h3>
          {serviciosTop.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin datos este mes</p>
          ) : (
            <div className="space-y-3">
              {serviciosTop.map((s, i) => {
                const max = serviciosTop[0]?.total || 1
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{s.nombre}</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.total}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(s.total / max) * 100}%`, background: s.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Citas por estado */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Citas por estado
          </h3>
          {citasPorEstado.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin datos este mes</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={citasPorEstado} dataKey="total" nameKey="estado" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {citasPorEstado.map((entry) => (
                      <Cell key={entry.estado} fill={ESTADO_COLOR[entry.estado] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '11px' }}
                    formatter={(v: number, _: unknown, p: { name: string }) => [v, ESTADO_LABEL[p.name] || p.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {citasPorEstado.map(e => (
                  <div key={e.estado} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ESTADO_COLOR[e.estado] || '#94a3b8' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{ESTADO_LABEL[e.estado] || e.estado}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{e.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila: Profesionales + Clientes frecuentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profesionales */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Profesionales con más citas
          </h3>
          {profesionalesTop.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin datos este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={profesionalesTop} layout="vertical" margin={{ left: 5, right: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={90} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(v: number) => [v, 'Citas']}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {profesionalesTop.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Clientes frecuentes */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Clientes más frecuentes
          </h3>
          {clientesFrecuentes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Sin datos este año</p>
          ) : (
            <div className="space-y-3">
              {clientesFrecuentes.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--brand)' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.nombre}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {c.total} cita{c.total !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
