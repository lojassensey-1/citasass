// src/app/api/superadmin/plans/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET() {
  try {
    await requireSuperAdmin()
    const planes = await prisma.plan.findMany({
      orderBy: { orden: 'asc' },
      include: { _count: { select: { empresas: true } } },
    })
    return apiSuccess(planes)
  } catch {
    return apiError('Error al obtener planes', 500)
  }
}

const planSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  precio: z.number().min(0),
  moneda: z.string().default('USD'),
  intervalo: z.string().default('monthly'),
  orden: z.number().default(0),
  esPopular: z.boolean().default(false),
  limiteUsuarios: z.number().nullable().optional(),
  limiteProfesionales: z.number().nullable().optional(),
  limiteClientes: z.number().nullable().optional(),
  limiteServicios: z.number().nullable().optional(),
  limiteSucursales: z.number().nullable().optional(),
  limiteCitasMes: z.number().nullable().optional(),
  limiteAlmacenMb: z.number().nullable().optional(),
  tieneIA: z.boolean().default(false),
  tieneAPI: z.boolean().default(false),
  tieneWhatsApp: z.boolean().default(false),
  tieneReportes: z.boolean().default(true),
  tieneInventario: z.boolean().default(false),
  tieneSucursales: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()
    const parsed = planSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const plan = await prisma.plan.create({ data: parsed.data as never })
    return apiSuccess(plan, 'Plan creado')
  } catch {
    return apiError('Error al crear plan', 500)
  }
}
