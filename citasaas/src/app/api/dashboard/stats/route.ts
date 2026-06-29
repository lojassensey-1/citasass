// src/app/api/dashboard/stats/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest) {
  try {
    const session = await requireAuth()
    const empresaId = session.empresaId

    const ahora = new Date()
    const inicioHoy = new Date(ahora)
    inicioHoy.setHours(0, 0, 0, 0)
    const finHoy = new Date(ahora)
    finHoy.setHours(23, 59, 59, 999)

    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)

    const [
      citasHoy,
      citasPendientes,
      clientesNuevosMes,
      totalClientes,
      totalProfesionales,
      ingresosMesRaw,
    ] = await Promise.all([
      prisma.cita.count({
        where: { empresaId, fechaInicio: { gte: inicioHoy, lte: finHoy } },
      }),
      prisma.cita.count({
        where: { empresaId, estado: { in: ['PENDIENTE', 'CONFIRMADA'] }, fechaInicio: { gte: ahora } },
      }),
      prisma.cliente.count({
        where: { empresaId, createdAt: { gte: inicioMes } },
      }),
      prisma.cliente.count({ where: { empresaId } }),
      prisma.profesional.count({ where: { empresaId, activo: true } }),
      prisma.cita.aggregate({
        where: {
          empresaId,
          pagado: true,
          fechaInicio: { gte: inicioMes, lte: finMes },
        },
        _sum: { precioCobrado: true },
      }),
    ])

    const ingresosMes = Number(ingresosMesRaw._sum.precioCobrado || 0)

    // Citas de la semana
    const citasSemana = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const dia = new Date(inicioHoy)
        dia.setDate(inicioHoy.getDate() - 6 + i)
        const diaFin = new Date(dia)
        diaFin.setHours(23, 59, 59, 999)
        const total = await prisma.cita.count({
          where: { empresaId, fechaInicio: { gte: dia, lte: diaFin } },
        })
        return {
          dia: dia.toLocaleDateString('es', { weekday: 'short' }),
          total,
        }
      })
    )

    // Próximas citas del día
    const proximasCitas = await prisma.cita.findMany({
      where: {
        empresaId,
        fechaInicio: { gte: ahora, lte: finHoy },
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
      include: {
        cliente: { select: { nombre: true, apellido: true } },
        profesional: { select: { nombre: true, color: true } },
        servicio: { select: { nombre: true, duracionMin: true } },
      },
      orderBy: { fechaInicio: 'asc' },
      take: 5,
    })

    return apiSuccess({
      citasHoy,
      citasPendientes,
      clientesNuevosMes,
      totalClientes,
      totalProfesionales,
      ingresosMes,
      citasSemana,
      proximasCitas,
    })
  } catch (error) {
    console.error('[DASHBOARD/STATS]', error)
    return apiError('Error al obtener estadísticas', 500)
  }
}
