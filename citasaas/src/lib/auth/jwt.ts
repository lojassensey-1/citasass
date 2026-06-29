// src/lib/auth/jwt.ts
// Manejo de tokens JWT con jose (compatible con Edge Runtime)

import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-solo-para-dev-cambiar-en-produccion'
)

export interface JWTPayload {
  sub: string        // userId
  empresaId: string
  email: string
  rol: string
  isSuperAdmin: boolean
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function signRefreshToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-cambiar-en-produccion'
  )
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}
