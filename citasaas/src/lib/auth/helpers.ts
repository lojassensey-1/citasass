// src/lib/auth/helpers.ts
// Utilidades de autenticación: obtener sesión, verificar permisos

import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './jwt'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('No autenticado')
  }
  return session
}

export async function requireSuperAdmin(): Promise<JWTPayload> {
  const session = await requireAuth()
  if (!session.isSuperAdmin) {
    throw new Error('Acceso denegado: se requiere Super Admin')
  }
  return session
}

export async function requireEmpresaAccess(empresaId: string): Promise<JWTPayload> {
  const session = await requireAuth()
  if (!session.isSuperAdmin && session.empresaId !== empresaId) {
    throw new Error('Acceso denegado: empresa no permitida')
  }
  return session
}

export function canAccess(session: JWTPayload, roles: string[]): boolean {
  if (session.isSuperAdmin) return true
  return roles.includes(session.rol)
}
