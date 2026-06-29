// src/app/api/dashboard/services/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(_: NextRequest) {
  try {
    const session = await requireAuth()
    const servicios = await prisma.servicio.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nombre: 'asc' },
    })
    return apiSuccess(servicios)
  } catch { return apiError('Error', 500) }
}

const schema = z.object({
  nombre:      z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  precio:      z.coerce.number().min(0, 'Precio inválido'),
  duracionMin: z.coerce.number().min(5, 'Mínimo 5 minutos'),
  color:       z.string().optional(),
  categoria:   z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const servicio = await prisma.servicio.create({
      data: { ...parsed.data, empresaId: session.empresaId },
    })
    return apiSuccess(servicio, 'Servicio creado')
  } catch { return apiError('Error', 500) }
}
