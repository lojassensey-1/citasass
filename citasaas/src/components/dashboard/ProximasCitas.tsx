// src/components/dashboard/ProximasCitas.tsx
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

interface Cita {
  id: string
  fechaInicio: Date
  cliente: { nombre: string; apellido?: string | null }
  profesional?: { nombre: string; color: string } | null
  servicio?: { nombre: string; duracionMin: number } | null
  estado: string
}

export function ProximasCitas({ citas }: { citas: Cita[] }) {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Próximas citas
        </h3>
        <Link
          href="/dashboard/agenda"
          className="text-xs font-medium"
          style={{ color: 'var(--brand)' }}
        >
          Ver agenda →
        </Link>
      </div>

      {citas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-subtle)' }}
          >
            <CalendarDays size={22} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No hay más citas hoy
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ¡Disfruta el tiempo libre!
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {citas.map((cita) => {
            const hora = format(new Date(cita.fechaInicio), 'HH:mm')
            const nombre = [cita.cliente.nombre, cita.cliente.apellido].filter(Boolean).join(' ')
            return (
              <div
                key={cita.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-subtle)' }}
              >
                {/* Barra de color del profesional */}
                <div
                  className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                  style={{ background: cita.profesional?.color || '#4f67ff' }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {nombre}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {cita.servicio?.nombre || 'Sin servicio'}
                    {cita.profesional && ` · ${cita.profesional.nombre}`}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {hora}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {cita.servicio?.duracionMin}min
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
