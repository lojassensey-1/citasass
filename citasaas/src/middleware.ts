// src/middleware.ts
// Middleware de autenticación y multi-tenant
// Se ejecuta en el Edge Runtime antes de cada request

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/',
]

// Rutas exclusivas del Super Admin
const SUPERADMIN_ROUTES = ['/superadmin', '/api/superadmin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas y archivos estáticos
  if (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Obtener token de cookie
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    // Redirigir a login si no hay token
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar token
  const payload = await verifyToken(token)

  if (!payload) {
    // Token inválido o expirado
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // Verificar acceso a rutas de Super Admin
  if (SUPERADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload.isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Inyectar datos del usuario en los headers (disponibles en Server Components)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-empresa-id', payload.empresaId)
  requestHeaders.set('x-user-rol', payload.rol)
  requestHeaders.set('x-is-superadmin', String(payload.isSuperAdmin))

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
