// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) return apiError('No autenticado', 401)

    const payload = await verifyToken(token)
    if (!payload) return apiError('Token inválido', 401)

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        avatar: true,
        isSuperAdmin: true,
        empresa: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            estado: true,
            trialEndsAt: true,
            colorPrimario: true,
            logo: true,
            planId: true,
            plan: {
              select: {
                nombre: true,
                tieneIA: true,
                tieneWhatsApp: true,
                tieneReportes: true,
                limiteUsuarios: true,
              },
            },
          },
        },
      },
    })

    if (!usuario) return apiError('Usuario no encontrado', 404)

    return apiSuccess(usuario)
  } catch (error) {
    console.error('[ME]', error)
    return apiError('Error interno', 500)
  }
}
