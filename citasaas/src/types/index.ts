// src/types/index.ts
// Tipos globales del proyecto CitaSaaS

export type EstadoEmpresa = 'TRIAL' | 'ACTIVA' | 'SUSPENDIDA' | 'CANCELADA' | 'VENCIDA'
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'
export type RolUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'RECEPCIONISTA' | 'PROFESIONAL'

export interface Plan {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  moneda: string
  intervalo: string
  activo: boolean
  esPopular: boolean
  limiteUsuarios?: number
  limiteProfesionales?: number
  limiteClientes?: number
  limiteServicios?: number
  limiteSucursales?: number
  limiteCitasMes?: number
  limiteAlmacenMb?: number
  tieneIA: boolean
  tieneAPI: boolean
  tieneWhatsApp: boolean
  tieneReportes: boolean
  tieneInventario: boolean
}

export interface Empresa {
  id: string
  nombre: string
  slug: string
  email: string
  telefono?: string
  logo?: string
  estado: EstadoEmpresa
  planId?: string
  plan?: Plan
  trialEndsAt?: Date
  colorPrimario: string
  pais?: string
  ciudad?: string
  createdAt: Date
  _count?: {
    usuarios: number
    clientes: number
    citas: number
  }
}

export interface Usuario {
  id: string
  empresaId: string
  email: string
  nombre: string
  apellido?: string
  rol: RolUsuario
  avatar?: string
  activo: boolean
  isSuperAdmin: boolean
}

export interface Cliente {
  id: string
  empresaId: string
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  celular?: string
  foto?: string
  notas?: string
  etiquetas: string[]
  estado: string
  whatsapp?: string
  createdAt: Date
  _count?: { citas: number }
}

export interface Profesional {
  id: string
  empresaId: string
  sucursalId?: string
  nombre: string
  apellido?: string
  especialidad?: string
  email?: string
  telefono?: string
  foto?: string
  color: string
  activo: boolean
  horario?: Record<string, { abre: string; cierra: string; activo: boolean }>
}

export interface Servicio {
  id: string
  empresaId: string
  nombre: string
  descripcion?: string
  precio: number
  duracionMin: number
  color: string
  activo: boolean
  categoria?: string
}

export interface Cita {
  id: string
  empresaId: string
  clienteId: string
  profesionalId?: string
  servicioId?: string
  sucursalId?: string
  fechaInicio: Date
  fechaFin: Date
  estado: EstadoCita
  notas?: string
  precioCobrado?: number
  pagado: boolean
  cliente?: Cliente
  profesional?: Profesional
  servicio?: Servicio
}

export interface DashboardStats {
  citasHoy: number
  citasPendientes: number
  clientesNuevosMes: number
  ingresosMes: number
  ocupacionPorcentaje: number
  citasSemana: { dia: string; total: number }[]
}

// Respuesta de API estandarizada
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
