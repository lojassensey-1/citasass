// src/app/api/dashboard/company/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(_: NextRequest) {
  try {
    const session = await requireAuth()
    const empresa = await prisma.empresa.findUnique({
      where: { id: session.empresaId },
      include: { plan: true },
    })
    if (!empresa) return apiError('Empresa no encontrada', 404)
    return apiSuccess(empresa)
  } catch { return apiError('Error', 500) }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Solo campos permitidos
    const allowed = ['nombre', 'email', 'telefono', 'sitioWeb', 'pais', 'ciudad',
      'direccion', 'timezone', 'moneda', 'idioma', 'colorPrimario']

    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key]
    }

    const empresa = await prisma.empresa.update({
      where: { id: session.empresaId },
      data,
    })
    return apiSuccess(empresa, 'Configuración guardada')
  } catch { return apiError('Error al guardar', 500) }
}
