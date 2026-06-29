// src/app/superadmin/planes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Check, X, Loader2, Star } from 'lucide-react'

interface Plan {
  id: string; nombre: string; descripcion?: string; precio: number; moneda: string
  esPopular: boolean; activo: boolean; orden: number
  limiteUsuarios?: number; limiteProfesionales?: number; limiteClientes?: number
  limiteServicios?: number; limiteSucursales?: number; limiteCitasMes?: number
  tieneIA: boolean; tieneWhatsApp: boolean; tieneReportes: boolean; tieneAPI: boolean; tieneInventario: boolean
  _count: { empresas: number }
}

const LIMITE_LABEL = (v?: number | null) => v === null || v === undefined ? 'Ilimitado' : String(v)

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Plan>>({})

  const cargar = async () => {
    setLoading(true)
    const res = await fetch('/api/superadmin/plans')
    const json = await res.json()
    if (json.success) setPlanes(json.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const iniciarEdicion = (plan: Plan) => {
    setEditando(plan.id)
    setForm({ ...plan })
  }

  const cancelar = () => { setEditando(null); setForm({}) }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await fetch(
        editando === 'nuevo' ? '/api/superadmin/plans' : `/api/superadmin/plans/${editando}`,
        {
          method: editando === 'nuevo' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )
      const json = await res.json()
      if (json.success) { toast.success('Plan guardado'); cargar(); cancelar() }
      else toast.error(json.error)
    } catch { toast.error('Error de conexión') }
    finally { setGuardando(false) }
  }

  const nuevoPlan = () => {
    setEditando('nuevo')
    setForm({
      nombre: '', precio: 0, moneda: 'USD', activo: true, esPopular: false,
      tieneIA: false, tieneWhatsApp: false, tieneReportes: true, tieneAPI: false, tieneInventario: false,
    })
  }

  const features = [
    { key: 'tieneReportes', label: 'Reportes' },
    { key: 'tieneWhatsApp', label: 'WhatsApp' },
    { key: 'tieneIA',       label: 'IA' },
    { key: 'tieneAPI',      label: 'API' },
    { key: 'tieneInventario', label: 'Inventario' },
  ]

  return (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Planes</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Gestiona los planes de suscripción</p>
        </div>
        <button onClick={nuevoPlan} className="btn-primary h-9"><Plus size={15} /> Nuevo plan</button>
      </div>

      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-5 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                ))}
              </div>
            ))
          ) : (
            [...(editando === 'nuevo' ? [{ id: 'nuevo' } as Plan] : []), ...planes].map(plan => {
              const enEdicion = editando === plan.id
              const data = enEdicion ? form : plan

              return (
                <div key={plan.id} className="card p-5 flex flex-col gap-4 relative">
                  {data.esPopular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <span className="badge-brand text-xs px-3 py-1 flex items-center gap-1">
                        <Star size={10} className="fill-current" /> Popular
                      </span>
                    </div>
                  )}

                  {/* Nombre y precio */}
                  {enEdicion ? (
                    <div className="space-y-3">
                      <input value={data.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="input font-semibold" placeholder="Nombre del plan" />
                      <div className="flex gap-2">
                        <input type="number" value={data.precio ?? 0} onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} className="input" placeholder="Precio" />
                        <select value={data.moneda || 'USD'} onChange={e => setForm(f => ({ ...f, moneda: e.target.value }))} className="input w-24">
                          <option>USD</option><option>COP</option><option>MXN</option><option>ARS</option>
                        </select>
                      </div>
                      <input value={data.descripcion || ''} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className="input text-sm" placeholder="Descripción breve" />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.nombre}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: plan.activo ? 'var(--success-light)' : 'var(--bg-subtle)', color: plan.activo ? 'var(--success)' : 'var(--text-muted)' }}>
                          {plan.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>${plan.precio}</span>
                        <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>{plan.moneda}/mes</span>
                      </div>
                      {plan.descripcion && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{plan.descripcion}</p>}
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{(plan._count?.empresas || 0)} empresa{(plan._count?.empresas || 0) !== 1 ? 's' : ''} activas</p>
                    </div>
                  )}

                  {/* Límites */}
                  <div className="space-y-1.5 text-sm">
                    {enEdicion ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['Usuarios', 'limiteUsuarios'],
                          ['Profesionales', 'limiteProfesionales'],
                          ['Clientes', 'limiteClientes'],
                          ['Servicios', 'limiteServicios'],
                          ['Sucursales', 'limiteSucursales'],
                          ['Citas/mes', 'limiteCitasMes'],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                            <input
                              type="number"
                              value={(data as Record<string, unknown>)[key] as number ?? ''}
                              onChange={e => setForm(f => ({ ...f, [key]: e.target.value === '' ? null : Number(e.target.value) }))}
                              className="input h-8 text-xs"
                              placeholder="∞ ilimitado"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {[
                          ['Usuarios', plan.limiteUsuarios],
                          ['Profesionales', plan.limiteProfesionales],
                          ['Clientes', plan.limiteClientes],
                          ['Citas/mes', plan.limiteCitasMes],
                        ].map(([label, val]) => (
                          <div key={String(label)} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{LIMITE_LABEL(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-2">
                    {features.map(({ key, label }) => {
                      const activo = (data as Record<string, unknown>)[key] as boolean
                      return enEdicion ? (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, [key]: !activo }))}
                          className="text-xs py-1.5 px-2 rounded-lg transition-colors font-medium"
                          style={{
                            background: activo ? 'var(--brand-light)' : 'var(--bg-subtle)',
                            color: activo ? 'var(--brand-text)' : 'var(--text-muted)',
                          }}
                        >
                          {activo ? '✓ ' : ''}{label}
                        </button>
                      ) : (
                        <div
                          key={key}
                          className="text-xs py-1.5 px-2 rounded-lg text-center"
                          style={{
                            background: activo ? 'var(--success-light)' : 'var(--bg-subtle)',
                            color: activo ? 'var(--success)' : 'var(--text-muted)',
                          }}
                        >
                          {activo ? '✓ ' : '— '}{label}
                        </div>
                      )
                    })}
                  </div>

                  {/* Acciones */}
                  {enEdicion ? (
                    <div className="flex gap-2 pt-1">
                      <button onClick={cancelar} className="btn-secondary flex-1 h-9 text-sm"><X size={14} /> Cancelar</button>
                      <button onClick={guardar} disabled={guardando} className="btn-primary flex-1 h-9 text-sm">
                        {guardando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => iniciarEdicion(plan)} className="btn-secondary w-full h-9 text-sm">
                      <Edit2 size={14} /> Editar plan
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
