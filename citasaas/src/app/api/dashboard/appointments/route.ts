// src/app/api/dashboard/appointments/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const profesionalId = searchParams.get('profesionalId')

    const where: Record<string, unknown> = { empresaId: session.empresaId }
    if (desde || hasta) {
      where.fechaInicio = {
        ...(desde ? { gte: new Date(desde) } : {}),
        ...(hasta ? { lte: new Date(hasta) } : {}),
      }
    }
    if (profesionalId) where.profesionalId = profesionalId

    const citas = await prisma.cita.findMany({
      where,
      include: {
        cliente:     { select: { id: true, nombre: true, apellido: true, celular: true } },
        profesional: { select: { id: true, nombre: true, color: true } },
        servicio:    { select: { id: true, nombre: true, duracionMin: true, precio: true, color: true } },
      },
      orderBy: { fechaInicio: 'asc' },
    })

    return apiSuccess(citas)
  } catch { return apiError('Error al obtener citas', 500) }
}

const citaSchema = z.object({
  clienteId:    z.string().min(1, 'Cliente requerido'),
  profesionalId:z.string().optional(),
  servicioId:   z.string().optional(),
  sucursalId:   z.string().optional(),
  fechaInicio:  z.string().min(1, 'Fecha requerida'),
  fechaFin:     z.string().min(1, 'Fecha fin requerida'),
  notas:        z.string().optional(),
  notasInternas:z.string().optional(),
  precioOriginal: z.coerce.number().optional(),
  precioCobrado:  z.coerce.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = citaSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const cita = await prisma.cita.create({
      data: {
        ...parsed.data,
        empresaId: session.empresaId,
        creadoPorId: session.sub,
        fechaInicio: new Date(parsed.data.fechaInicio),
        fechaFin: new Date(parsed.data.fechaFin),
        estado: 'PENDIENTE',
      } as never,
      include: {
        cliente:     { select: { nombre: true, apellido: true } },
        profesional: { select: { nombre: true, color: true } },
        servicio:    { select: { nombre: true } },
      },
    })

    return apiSuccess(cita, 'Cita creada')
  } catch { return apiError('Error al crear cita', 500) }
}
