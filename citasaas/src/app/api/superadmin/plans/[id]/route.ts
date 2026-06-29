// src/app/api/superadmin/plans/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    const body = await request.json()
    const plan = await prisma.plan.update({ where: { id: params.id }, data: body })
    return apiSuccess(plan, 'Plan actualizado')
  } catch {
    return apiError('Error al actualizar plan', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    await prisma.plan.delete({ where: { id: params.id } })
    return apiSuccess(null, 'Plan eliminado')
  } catch {
    return apiError('Error al eliminar plan', 500)
  }
}
