// src/app/api/superadmin/companies/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth/helpers'
import { apiSuccess, apiError, slugify } from '@/lib/utils'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const estado = searchParams.get('estado') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      slug: { not: '__sistema__' },
      ...(q && {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(estado && { estado: estado as never }),
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        include: {
          plan: { select: { nombre: true, precio: true } },
          _count: {
            select: { usuarios: true, clientes: true, citas: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ])

    return apiSuccess({ empresas, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[SUPERADMIN/COMPANIES GET]', error)
    return apiError('Error al obtener empresas', 500)
  }
}

const crearEmpresaSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  planId: z.string().optional(),
  trialDias: z.number().min(0).max(365).default(7),
})

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()

    const body = await request.json()
    const parsed = crearEmpresaSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const { nombre, email, telefono, planId, trialDias } = parsed.data

    let slug = slugify(nombre)
    const existe = await prisma.empresa.findUnique({ where: { slug } })
    if (existe) slug = `${slug}-${Date.now().toString(36)}`

    const trialEndsAt = trialDias > 0
      ? new Date(Date.now() + trialDias * 24 * 60 * 60 * 1000)
      : null

    const empresa = await prisma.empresa.create({
      data: {
        nombre,
        slug,
        email,
        telefono,
        planId,
        estado: 'TRIAL',
        trialEndsAt,
      },
    })

    return apiSuccess(empresa, 'Empresa creada correctamente')
  } catch (error) {
    console.error('[SUPERADMIN/COMPANIES POST]', error)
    return apiError('Error al crear empresa', 500)
  }
}
