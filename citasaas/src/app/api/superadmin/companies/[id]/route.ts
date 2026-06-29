// src/app/api/superadmin/companies/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    const empresa = await prisma.empresa.findUnique({
      where: { id: params.id },
      include: {
        plan: true,
        usuarios: { select: { id: true, nombre: true, email: true, rol: true, activo: true } },
        _count: { select: { clientes: true, citas: true, profesionales: true } },
      },
    })
    if (!empresa) return apiError('Empresa no encontrada', 404)
    return apiSuccess(empresa)
  } catch (e) {
    return apiError('Error al obtener empresa', 500)
  }
}

const updateSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  estado: z.enum(['TRIAL', 'ACTIVA', 'SUSPENDIDA', 'CANCELADA', 'VENCIDA']).optional(),
  planId: z.string().optional(),
  trialEndsAt: z.string().optional(),
  colorPrimario: z.string().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.trialEndsAt) data.trialEndsAt = new Date(parsed.data.trialEndsAt)

    const empresa = await prisma.empresa.update({
      where: { id: params.id },
      data,
    })
    return apiSuccess(empresa, 'Empresa actualizada')
  } catch (e) {
    return apiError('Error al actualizar empresa', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    await prisma.empresa.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Empresa eliminada')
  } catch (e) {
    return apiError('Error al eliminar empresa', 500)
  }
}
