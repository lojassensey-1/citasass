// src/app/dashboard/reportes/page.tsx
import { getSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { ReportesCliente } from '@/components/dashboard/ReportesCliente'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const session = await getSession()
  if (!session) return null

  const empresaId = session.empresaId
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const inicioAnio = new Date(ahora.getFullYear(), 0, 1)

  // Estadísticas del mes
  const [
    citasMes,
    cancelacionesMes,
    ingresosMesRaw,
    ingresosAnioRaw,
    serviciosTop,
    profesionalesTop,
    clientesFrecuentes,
    citasPorEstado,
  ] = await Promise.all([
    prisma.cita.count({ where: { empresaId, createdAt: { gte: inicioMes } } }),
    prisma.cita.count({ where: { empresaId, estado: 'CANCELADA', createdAt: { gte: inicioMes } } }),
    prisma.cita.aggregate({
      where: { empresaId, pagado: true, createdAt: { gte: inicioMes } },
      _sum: { precioCobrado: true },
    }),
    prisma.cita.aggregate({
      where: { empresaId, pagado: true, createdAt: { gte: inicioAnio } },
      _sum: { precioCobrado: true },
    }),
    // Servicios más solicitados
    prisma.cita.groupBy({
      by: ['servicioId'],
      where: { empresaId, servicioId: { not: null }, createdAt: { gte: inicioMes } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    // Profesionales con más citas
    prisma.cita.groupBy({
      by: ['profesionalId'],
      where: { empresaId, profesionalId: { not: null }, createdAt: { gte: inicioMes } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    // Clientes frecuentes
    prisma.cita.groupBy({
      by: ['clienteId'],
      where: { empresaId, createdAt: { gte: inicioAnio } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    // Citas por estado
    prisma.cita.groupBy({
      by: ['estado'],
      where: { empresaId, createdAt: { gte: inicioMes } },
      _count: { id: true },
    }),
  ])

  // Resolver nombres de servicios
  const serviciosIds = serviciosTop.map(s => s.servicioId!).filter(Boolean)
  const serviciosNombres = await prisma.servicio.findMany({
    where: { id: { in: serviciosIds } },
    select: { id: true, nombre: true, color: true },
  })

  // Resolver nombres de profesionales
  const profesionalesIds = profesionalesTop.map(p => p.profesionalId!).filter(Boolean)
  const profesionalesNombres = await prisma.profesional.findMany({
    where: { id: { in: profesionalesIds } },
    select: { id: true, nombre: true, apellido: true, color: true },
  })

  // Resolver nombres de clientes
  const clientesIds = clientesFrecuentes.map(c => c.clienteId)
  const clientesNombres = await prisma.cliente.findMany({
    where: { id: { in: clientesIds } },
    select: { id: true, nombre: true, apellido: true },
  })

  const ingresosMes = Number(ingresosMesRaw._sum.precioCobrado || 0)
  const ingresosAnio = Number(ingresosAnioRaw._sum.precioCobrado || 0)
  const tasaCancelacion = citasMes > 0 ? Math.round((cancelacionesMes / citasMes) * 100) : 0

  // Ingresos por mes (últimos 6 meses)
  const ingresosPorMes = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1)
      const fin = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i) + 1, 0)
      const agg = await prisma.cita.aggregate({
        where: { empresaId, pagado: true, createdAt: { gte: inicio, lte: fin } },
        _sum: { precioCobrado: true },
      })
      return {
        mes: inicio.toLocaleString('es', { month: 'short' }),
        ingresos: Number(agg._sum.precioCobrado || 0),
      }
    })
  )

  const data = {
    resumen: { citasMes, cancelacionesMes, tasaCancelacion, ingresosMes, ingresosAnio },
    serviciosTop: serviciosTop.map(s => ({
      nombre: serviciosNombres.find(n => n.id === s.servicioId)?.nombre || 'Desconocido',
      color: serviciosNombres.find(n => n.id === s.servicioId)?.color || '#4f67ff',
      total: s._count.id,
    })),
    profesionalesTop: profesionalesTop.map(p => ({
      nombre: (() => {
        const prof = profesionalesNombres.find(n => n.id === p.profesionalId)
        return prof ? [prof.nombre, prof.apellido].filter(Boolean).join(' ') : 'Desconocido'
      })(),
      color: profesionalesNombres.find(n => n.id === p.profesionalId)?.color || '#4f67ff',
      total: p._count.id,
    })),
    clientesFrecuentes: clientesFrecuentes.map(c => ({
      nombre: (() => {
        const cli = clientesNombres.find(n => n.id === c.clienteId)
        return cli ? [cli.nombre, cli.apellido].filter(Boolean).join(' ') : 'Desconocido'
      })(),
      total: c._count.id,
    })),
    citasPorEstado: citasPorEstado.map(e => ({ estado: e.estado, total: e._count.id })),
    ingresosPorMes,
  }

  return (
    <>
      <Header titulo="Reportes" subtitulo="Análisis de tu negocio este mes" />
      <div className="flex-1 p-6 animate-fade-in">
        <ReportesCliente data={data} />
      </div>
    </>
  )
}
