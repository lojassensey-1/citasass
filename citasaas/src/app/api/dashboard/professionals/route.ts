// src/app/api/dashboard/professionals/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError, colorAleatorio } from '@/lib/utils'
import { z } from 'zod'

export async function GET(_: NextRequest) {
  try {
    const session = await requireAuth()
    const profesionales = await prisma.profesional.findMany({
      where: { empresaId: session.empresaId },
      include: { sucursal: { select: { nombre: true } }, _count: { select: { citas: true } } },
      orderBy: { nombre: 'asc' },
    })
    return apiSuccess(profesionales)
  } catch { return apiError('Error', 500) }
}

const schema = z.object({
  nombre:      z.string().min(1, 'Nombre requerido'),
  apellido:    z.string().optional(),
  especialidad:z.string().optional(),
  email:       z.string().email().optional().or(z.literal('')),
  telefono:    z.string().optional(),
  color:       z.string().optional(),
  sucursalId:  z.string().optional(),
  serviciosIds:z.array(z.string()).optional(),
  horario:     z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const prof = await prisma.profesional.create({
      data: {
        ...parsed.data,
        empresaId: session.empresaId,
        email: parsed.data.email || null,
        color: parsed.data.color || colorAleatorio(),
      } as never,
    })
    return apiSuccess(prof, 'Profesional creado')
  } catch { return apiError('Error', 500) }
}
