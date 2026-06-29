// src/app/api/dashboard/clients/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const cliente = await prisma.cliente.findFirst({
      where: { id: params.id, empresaId: session.empresaId },
      include: {
        citas: {
          include: {
            profesional: { select: { nombre: true, color: true } },
            servicio: { select: { nombre: true } },
          },
          orderBy: { fechaInicio: 'desc' },
          take: 10,
        },
        _count: { select: { citas: true } },
      },
    })
    if (!cliente) return apiError('Cliente no encontrado', 404)
    return apiSuccess(cliente)
  } catch { return apiError('Error', 500) }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const existe = await prisma.cliente.findFirst({ where: { id: params.id, empresaId: session.empresaId } })
    if (!existe) return apiError('No encontrado', 404)

    if (body.fechaNac) body.fechaNac = new Date(body.fechaNac)
    if (body.email === '') body.email = null

    const cliente = await prisma.cliente.update({ where: { id: params.id }, data: body })
    return apiSuccess(cliente, 'Cliente actualizado')
  } catch { return apiError('Error', 500) }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const existe = await prisma.cliente.findFirst({ where: { id: params.id, empresaId: session.empresaId } })
    if (!existe) return apiError('No encontrado', 404)
    await prisma.cliente.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Cliente eliminado')
  } catch { return apiError('Error', 500) }
}
