// src/app/api/dashboard/clients/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      empresaId: session.empresaId,
      ...(q && {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' as const } },
          { apellido: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { celular: { contains: q, mode: 'insensitive' as const } },
          { telefono: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: { _count: { select: { citas: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cliente.count({ where }),
    ])

    return apiSuccess({ clientes, total, page, limit })
  } catch (e) {
    return apiError('Error al obtener clientes', 500)
  }
}

const clienteSchema = z.object({
  nombre:   z.string().min(1, 'Nombre requerido'),
  apellido: z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
  telefono: z.string().optional(),
  celular:  z.string().optional(),
  whatsapp: z.string().optional(),
  notas:    z.string().optional(),
  etiquetas: z.array(z.string()).optional(),
  genero:   z.string().optional(),
  fechaNac: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = clienteSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

    const data = {
      ...parsed.data,
      empresaId: session.empresaId,
      email: parsed.data.email || null,
      fechaNac: parsed.data.fechaNac ? new Date(parsed.data.fechaNac) : null,
    }

    const cliente = await prisma.cliente.create({ data: data as never })
    return apiSuccess(cliente, 'Cliente creado')
  } catch {
    return apiError('Error al crear cliente', 500)
  }
}
