// src/app/dashboard/page.tsx
import { getSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { ProximasCitas } from '@/components/dashboard/ProximasCitas'
import { GraficoCitas } from '@/components/dashboard/GraficoCitas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const empresaId = session.empresaId
  const ahora = new Date()
  const inicioHoy = new Date(ahora); inicioHoy.setHours(0,0,0,0)
  const finHoy    = new Date(ahora); finHoy.setHours(23,59,59,999)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const [
    citasHoy,
    citasPendientes,
    clientesNuevosMes,
    totalClientes,
    ingresosMesRaw,
    proximasCitas,
  ] = await Promise.all([
    prisma.cita.count({ where: { empresaId, fechaInicio: { gte: inicioHoy, lte: finHoy } } }),
    prisma.cita.count({ where: { empresaId, estado: { in: ['PENDIENTE','CONFIRMADA'] }, fechaInicio: { gte: ahora } } }),
    prisma.cliente.count({ where: { empresaId, createdAt: { gte: inicioMes } } }),
    prisma.cliente.count({ where: { empresaId } }),
    prisma.cita.aggregate({
      where: { empresaId, pagado: true, fechaInicio: { gte: inicioMes } },
      _sum: { precioCobrado: true },
    }),
    prisma.cita.findMany({
      where: { empresaId, fechaInicio: { gte: ahora, lte: finHoy }, estado: { in: ['PENDIENTE','CONFIRMADA'] } },
      include: {
        cliente:     { select: { nombre: true, apellido: true } },
        profesional: { select: { nombre: true, color: true } },
        servicio:    { select: { nombre: true, duracionMin: true } },
      },
      orderBy: { fechaInicio: 'asc' },
      take: 6,
    }),
  ])

  // Gráfico últimos 7 días
  const citasSemana = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const d = new Date(inicioHoy)
      d.setDate(inicioHoy.getDate() - 6 + i)
      const df = new Date(d); df.setHours(23,59,59,999)
      const total = await prisma.cita.count({ where: { empresaId, fechaInicio: { gte: d, lte: df } } })
      return { dia: format(d, 'EEE', { locale: es }), total }
    })
  )

  const ingresosMes = Number(ingresosMesRaw._sum.precioCobrado || 0)
  const fechaHoy = format(ahora, "EEEE d 'de' MMMM", { locale: es })

  return (
    <>
      <Header
        titulo="Panel principal"
        subtitulo={fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
      />

      <div className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* KPIs */}
        <DashboardStats
          citasHoy={citasHoy}
          citasPendientes={citasPendientes}
          clientesNuevosMes={clientesNuevosMes}
          totalClientes={totalClientes}
          ingresosMes={ingresosMes}
        />

        {/* Gráfico + Próximas citas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <GraficoCitas data={citasSemana} />
          </div>
          <div className="lg:col-span-2">
            <ProximasCitas citas={proximasCitas as never} />
          </div>
        </div>
      </div>
    </>
  )
}
