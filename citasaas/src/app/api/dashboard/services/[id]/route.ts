// src/app/api/dashboard/services/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const existe = await prisma.servicio.findFirst({ where: { id: params.id, empresaId: session.empresaId } })
    if (!existe) return apiError('No encontrado', 404)
    const srv = await prisma.servicio.update({ where: { id: params.id }, data: body })
    return apiSuccess(srv, 'Servicio actualizado')
  } catch { return apiError('Error', 500) }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const existe = await prisma.servicio.findFirst({ where: { id: params.id, empresaId: session.empresaId } })
    if (!existe) return apiError('No encontrado', 404)
    await prisma.servicio.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Servicio eliminado')
  } catch { return apiError('Error', 500) }
}
