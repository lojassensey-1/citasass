// src/app/api/superadmin/stats/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest) {
  try {
    await requireSuperAdmin()

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioAnio = new Date(ahora.getFullYear(), 0, 1)

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
      empresasPorPlan,
    ] = await Promise.all([
      prisma.empresa.count({ where: { slug: { not: '__sistema__' } } }),
      prisma.empresa.count({ where: { estado: 'ACTIVA' } }),
      prisma.empresa.count({ where: { estado: 'TRIAL' } }),
      prisma.empresa.count({ where: { estado: 'SUSPENDIDA' } }),
      prisma.empresa.count({ where: { estado: 'VENCIDA' } }),
      prisma.empresa.count({
        where: { createdAt: { gte: inicioMes }, slug: { not: '__sistema__' } },
      }),
      prisma.usuario.count({ where: { isSuperAdmin: false } }),
      prisma.cita.count(),
      prisma.cita.count({ where: { createdAt: { gte: inicioMes } } }),
      prisma.empresa.groupBy({
        by: ['planId'],
        _count: { id: true },
        where: { planId: { not: null }, slug: { not: '__sistema__' } },
      }),
    ])

    // Crecimiento últimos 6 meses
    const crecimiento = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1)
        const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i) + 1, 0)
        const total = await prisma.empresa.count({
          where: {
            createdAt: { gte: fecha, lte: fechaFin },
            slug: { not: '__sistema__' },
          },
        })
        return {
          mes: fecha.toLocaleString('es', { month: 'short', year: '2-digit' }),
          total,
        }
      })
    )

    return apiSuccess({
      resumen: {
        totalEmpresas,
        empresasActivas,
        empresasTrial,
        empresasSuspendidas,
        empresasVencidas,
        nuevasMes,
        totalUsuarios,
        totalCitas,
        citasMes,
      },
      crecimiento,
      empresasPorPlan,
    })
  } catch (error) {
    console.error('[SUPERADMIN/STATS]', error)
    return apiError('Error al obtener estadísticas', 500)
  }
}
