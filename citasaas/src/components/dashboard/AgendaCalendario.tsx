// src/components/dashboard/AgendaCalendario.tsx
'use client'

import { format, addDays, addWeeks, subWeeks, addMonths, subMonths,
  startOfWeek, eachDayOfInterval, isSameDay, isToday, getHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Cita {
  id: string
  fechaInicio: string
  fechaFin: string
  estado: string
  cliente: { nombre: string; apellido?: string }
  profesional?: { nombre: string; color: string }
  servicio?: { nombre: string; duracionMin: number }
}

interface Props {
  citas: unknown[]
  loading: boolean
  vista: 'dia' | 'semana' | 'mes'
  onVistaCambio: (v: 'dia' | 'semana' | 'mes') => void
  fechaActual: Date
  onFechaCambio: (d: Date) => void
  onCitaClick: (cita: unknown) => void
  onNuevaCita: (fecha: Date) => void
}

const HORAS = Array.from({ length: 13 }, (_, i) => i + 7) // 7am - 7pm
const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:  '#f59e0b',
  CONFIRMADA: '#4f67ff',
  EN_CURSO:   '#8b5cf6',
  COMPLETADA: '#10b981',
  CANCELADA:  '#ef4444',
  NO_ASISTIO: '#6b7280',
}

export function AgendaCalendario({ citas, loading, vista, onVistaCambio, fechaActual, onFechaCambio, onCitaClick, onNuevaCita }: Props) {
  const citasTyped = citas as Cita[]

  const navegarAtras = () => {
    if (vista === 'dia') onFechaCambio(addDays(fechaActual, -1))
    else if (vista === 'semana') onFechaCambio(subWeeks(fechaActual, 1))
    else onFechaCambio(subMonths(fechaActual, 1))
  }
  const navegarAdelante = () => {
    if (vista === 'dia') onFechaCambio(addDays(fechaActual, 1))
    else if (vista === 'semana') onFechaCambio(addWeeks(fechaActual, 1))
    else onFechaCambio(addMonths(fechaActual, 1))
  }

  const diasSemana = eachDayOfInterval({
    start: startOfWeek(fechaActual, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(fechaActual, { weekStartsOn: 1 }), 6),
  })

  const citasDel = (dia: Date) =>
    citasTyped.filter(c => isSameDay(new Date(c.fechaInicio), dia))

  const alturaHora = 60 // px por hora
  const citaPosicion = (cita: Cita) => {
    const inicio = new Date(cita.fechaInicio)
    const fin = new Date(cita.fechaFin)
    const top = (getHours(inicio) - 7 + inicio.getMinutes() / 60) * alturaHora
    const durHoras = (fin.getTime() - inicio.getTime()) / 3600000
    const height = Math.max(durHoras * alturaHora, 30)
    return { top, height }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <button onClick={navegarAtras} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle] transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-sm font-semibold min-w-[160px] text-center capitalize" style={{ color: 'var(--text-primary)' }}>
            {vista === 'semana'
              ? `${format(diasSemana[0], "d MMM", { locale: es })} — ${format(diasSemana[6], "d MMM yyyy", { locale: es })}`
              : format(fechaActual, vista === 'dia' ? "EEEE d 'de' MMMM" : "MMMM yyyy", { locale: es })
            }
          </h2>
          <button onClick={navegarAdelante} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle] transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => onFechaCambio(new Date())} className="btn-secondary h-8 text-xs ml-1">Hoy</button>
        </div>

        {/* Selector de vista */}
        <div className="flex rounded-xl p-0.5" style={{ background: 'var(--bg-subtle)' }}>
          {(['dia', 'semana', 'mes'] as const).map(v => (
            <button
              key={v}
              onClick={() => onVistaCambio(v)}
              className="px-3 h-7 rounded-lg text-xs font-medium transition-all capitalize"
              style={{
                background: vista === v ? 'var(--bg)' : 'transparent',
                color: vista === v ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: vista === v ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Vista Semana */}
      {vista === 'semana' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Columna de horas */}
          <div className="flex-shrink-0 w-14 border-r" style={{ borderColor: 'var(--border)' }}>
            <div className="h-12 border-b" style={{ borderColor: 'var(--border)' }} />
            <div style={{ height: `${HORAS.length * alturaHora}px` }} className="relative">
              {HORAS.map(h => (
                <div
                  key={h}
                  className="absolute w-full flex items-start justify-end pr-2"
                  style={{ top: `${(h - 7) * alturaHora}px`, height: `${alturaHora}px` }}
                >
                  <span className="text-xs -mt-2" style={{ color: 'var(--text-muted)' }}>
                    {h}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Días */}
          <div className="flex flex-1 overflow-x-auto overflow-y-auto">
            {diasSemana.map(dia => {
              const hoy = isToday(dia)
              const citasDia = citasDel(dia)
              return (
                <div key={dia.toISOString()} className="flex-1 min-w-[120px] border-r" style={{ borderColor: 'var(--border)' }}>
                  {/* Header del día */}
                  <div
                    className="h-12 border-b flex flex-col items-center justify-center sticky top-0 z-10"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                      {format(dia, 'EEE', { locale: es })}
                    </span>
                    <div
                      className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mt-0.5"
                      style={{
                        background: hoy ? 'var(--brand)' : 'transparent',
                        color: hoy ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {format(dia, 'd')}
                    </div>
                  </div>

                  {/* Celda de citas */}
                  <div
                    className="relative cursor-pointer"
                    style={{ height: `${HORAS.length * alturaHora}px` }}
                    onClick={() => {
                      const d = new Date(dia)
                      d.setHours(9, 0, 0, 0)
                      onNuevaCita(d)
                    }}
                  >
                    {/* Líneas de hora */}
                    {HORAS.map(h => (
                      <div
                        key={h}
                        className="absolute w-full border-t"
                        style={{ top: `${(h - 7) * alturaHora}px`, borderColor: 'var(--border)' }}
                      />
                    ))}

                    {/* Citas */}
                    {citasDia.map(cita => {
                      const { top, height } = citaPosicion(cita)
                      const color = cita.profesional?.color || ESTADO_COLOR[cita.estado] || '#4f67ff'
                      const nombre = [cita.cliente.nombre, cita.cliente.apellido].filter(Boolean).join(' ')
                      return (
                        <div
                          key={cita.id}
                          className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            background: `${color}22`,
                            borderLeft: `3px solid ${color}`,
                          }}
                          onClick={e => { e.stopPropagation(); onCitaClick(cita) }}
                        >
                          <p className="text-xs font-medium truncate" style={{ color }}>
                            {format(new Date(cita.fechaInicio), 'HH:mm')}
                          </p>
                          {height > 40 && (
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{nombre}</p>
                          )}
                          {height > 55 && cita.servicio && (
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{cita.servicio.nombre}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vista Día */}
      {vista === 'dia' && (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-shrink-0 w-14 border-r" style={{ borderColor: 'var(--border)' }}>
            <div style={{ height: `${HORAS.length * alturaHora}px` }} className="relative mt-4">
              {HORAS.map(h => (
                <div key={h} className="absolute w-full flex items-start justify-end pr-2" style={{ top: `${(h - 7) * alturaHora}px` }}>
                  <span className="text-xs -mt-2" style={{ color: 'var(--text-muted)' }}>{h}:00</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto relative" style={{ height: `${HORAS.length * alturaHora}px` }}>
            {HORAS.map(h => (
              <div key={h} className="absolute w-full border-t" style={{ top: `${(h - 7) * alturaHora}px`, borderColor: 'var(--border)' }} />
            ))}
            {citasDel(fechaActual).map(cita => {
              const { top, height } = citaPosicion(cita)
              const color = cita.profesional?.color || '#4f67ff'
              const nombre = [cita.cliente.nombre, cita.cliente.apellido].filter(Boolean).join(' ')
              return (
                <div
                  key={cita.id}
                  className="absolute left-2 right-2 rounded-xl px-3 py-2 cursor-pointer hover:opacity-90"
                  style={{ top: `${top}px`, height: `${height}px`, background: `${color}20`, borderLeft: `4px solid ${color}` }}
                  onClick={() => onCitaClick(cita)}
                >
                  <p className="text-sm font-semibold" style={{ color }}>{format(new Date(cita.fechaInicio), 'HH:mm')} — {format(new Date(cita.fechaFin), 'HH:mm')}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{nombre}</p>
                  {cita.servicio && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{cita.servicio.nombre}</p>}
                  {cita.profesional && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>con {cita.profesional.nombre}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30 z-20">
          <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand)' }} />
        </div>
      )}
    </div>
  )
}
