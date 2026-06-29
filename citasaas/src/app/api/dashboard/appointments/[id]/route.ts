// src/app/api/dashboard/appointments/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const existe = await prisma.cita.findFirst({
      where: { id: params.id, empresaId: session.empresaId },
    })
    if (!existe) return apiError('Cita no encontrada', 404)

    const data: Record<string, unknown> = { ...body }
    if (body.fechaInicio) data.fechaInicio = new Date(body.fechaInicio)
    if (body.fechaFin)    data.fechaFin    = new Date(body.fechaFin)

    const cita = await prisma.cita.update({
      where: { id: params.id },
      data,
      include: {
        cliente:     { select: { nombre: true, apellido: true } },
        profesional: { select: { nombre: true, color: true } },
        servicio:    { select: { nombre: true } },
      },
    })
    return apiSuccess(cita, 'Cita actualizada')
  } catch { return apiError('Error', 500) }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const existe = await prisma.cita.findFirst({ where: { id: params.id, empresaId: session.empresaId } })
    if (!existe) return apiError('Cita no encontrada', 404)
    await prisma.cita.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Cita eliminada')
  } catch { return apiError('Error', 500) }
}
