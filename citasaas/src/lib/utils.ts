// src/lib/utils.ts
// Utilidades generales del proyecto

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

// Combinar clases Tailwind sin conflictos
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear moneda
export function formatCurrency(amount: number | string, currency = 'COP'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(num)
}

// Formatear fecha
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return `Hoy, ${format(d, 'HH:mm')}`
  if (isTomorrow(d)) return `Mañana, ${format(d, 'HH:mm')}`
  return format(d, "d 'de' MMMM, HH:mm", { locale: es })
}

// Formatear fecha relativa
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

// Iniciales para avatar
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Días restantes de trial
export function getDaysRemaining(endDate: Date | string | null): number {
  if (!endDate) return 0
  const d = typeof endDate === 'string' ? new Date(endDate) : endDate
  const diff = d.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Respuesta de API estandarizada
export function apiSuccess<T>(data: T, message?: string) {
  return Response.json({ success: true, data, message })
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

// Slugify
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Generar color aleatorio para profesionales
export const COLORES_PROFESIONALES = [
  '#4f67ff', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
]

export function colorAleatorio(): string {
  return COLORES_PROFESIONALES[Math.floor(Math.random() * COLORES_PROFESIONALES.length)]
}
