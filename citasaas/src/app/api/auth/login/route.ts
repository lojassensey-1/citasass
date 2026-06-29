// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { apiSuccess, apiError } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422)
    }

    const { email, password } = parsed.data

    // Buscar usuario en cualquier empresa
    const usuario = await prisma.usuario.findFirst({
      where: { email: email.toLowerCase(), activo: true },
      include: { empresa: true },
    })

    if (!usuario) {
      return apiError('Credenciales incorrectas', 401)
    }

    const passwordOk = await bcrypt.compare(password, usuario.password)
    if (!passwordOk) {
      return apiError('Credenciales incorrectas', 401)
    }

    // Verificar estado de la empresa (excepto super admin)
    if (!usuario.isSuperAdmin) {
      const empresa = usuario.empresa
      if (empresa.estado === 'SUSPENDIDA') {
        return apiError('Tu cuenta está suspendida. Contacta al soporte.', 403)
      }
      if (empresa.estado === 'CANCELADA') {
        return apiError('Esta cuenta ha sido cancelada.', 403)
      }
    }

    // Generar token
    const token = await signToken({
      sub: usuario.id,
      empresaId: usuario.empresaId,
      email: usuario.email,
      rol: usuario.rol,
      isSuperAdmin: usuario.isSuperAdmin,
    })

    // Actualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        empresaId: usuario.empresaId,
        usuarioId: usuario.id,
        accion: 'LOGIN',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    const response = apiSuccess(
      {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          isSuperAdmin: usuario.isSuperAdmin,
          empresaId: usuario.empresaId,
          empresa: {
            id: usuario.empresa.id,
            nombre: usuario.empresa.nombre,
            slug: usuario.empresa.slug,
            estado: usuario.empresa.estado,
            trialEndsAt: usuario.empresa.trialEndsAt,
            colorPrimario: usuario.empresa.colorPrimario,
          },
        },
      },
      'Sesión iniciada correctamente'
    )

    // Establecer cookie HttpOnly
    const res = new Response(response.body, response)
    res.headers.set(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    )

    return res
  } catch (error) {
    console.error('[LOGIN]', error)
    return apiError('Error interno del servidor', 500)
  }
}
