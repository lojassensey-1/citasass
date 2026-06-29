// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { apiSuccess, apiError, slugify } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  nombreEmpresa: z.string().min(2, 'Nombre de empresa requerido'),
  nombre: z.string().min(2, 'Tu nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  telefono: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422)
    }

    const { nombreEmpresa, nombre, email, password, telefono } = parsed.data

    // Verificar si el email ya existe
    const emailExiste = await prisma.usuario.findFirst({
      where: { email: email.toLowerCase() },
    })
    if (emailExiste) {
      return apiError('Este email ya está registrado', 409)
    }

    // Obtener plan trial / básico
    const planBasico = await prisma.plan.findFirst({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    })

    // Generar slug único para la empresa
    let slug = slugify(nombreEmpresa)
    const slugExiste = await prisma.empresa.findUnique({ where: { slug } })
    if (slugExiste) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Calcular fecha fin de trial (configurable, por defecto 7 días)
    const trialDias = 7
    const trialEndsAt = new Date(Date.now() + trialDias * 24 * 60 * 60 * 1000)

    // Crear empresa + admin en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nombre: nombreEmpresa,
          slug,
          email: email.toLowerCase(),
          telefono,
          estado: 'TRIAL',
          planId: planBasico?.id,
          trialEndsAt,
        },
      })

      const hashedPassword = await bcrypt.hash(password, 12)
      const admin = await tx.usuario.create({
        data: {
          empresaId: empresa.id,
          email: email.toLowerCase(),
          nombre,
          password: hashedPassword,
          rol: 'ADMIN',
        },
      })

      // Sucursal principal por defecto
      await tx.sucursal.create({
        data: {
          empresaId: empresa.id,
          nombre: nombreEmpresa,
          esMatriz: true,
          horario: {
            lunes:    { abre: '08:00', cierra: '18:00', activo: true },
            martes:   { abre: '08:00', cierra: '18:00', activo: true },
            miercoles:{ abre: '08:00', cierra: '18:00', activo: true },
            jueves:   { abre: '08:00', cierra: '18:00', activo: true },
            viernes:  { abre: '08:00', cierra: '17:00', activo: true },
            sabado:   { abre: '09:00', cierra: '13:00', activo: false },
            domingo:  { abre: null,    cierra: null,     activo: false },
          },
        },
      })

      return { empresa, admin }
    })

    // Generar token
    const token = await signToken({
      sub: resultado.admin.id,
      empresaId: resultado.empresa.id,
      email: resultado.admin.email,
      rol: resultado.admin.rol,
      isSuperAdmin: false,
    })

    const response = apiSuccess(
      {
        empresa: {
          id: resultado.empresa.id,
          nombre: resultado.empresa.nombre,
          slug: resultado.empresa.slug,
          trialEndsAt: resultado.empresa.trialEndsAt,
        },
      },
      `¡Bienvenido! Tu prueba gratuita de ${trialDias} días ha comenzado.`
    )

    const res = new Response(response.body, response)
    res.headers.set(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    )

    return res
  } catch (error) {
    console.error('[REGISTER]', error)
    return apiError('Error interno del servidor', 500)
  }
}
