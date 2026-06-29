// src/components/dashboard/CitaModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { X, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Cita {
  id?: string; clienteId?: string; profesionalId?: string; servicioId?: string
  fechaInicio?: string | Date; fechaFin?: string | Date
  estado?: string; notas?: string; precioCobrado?: number; pagado?: boolean
  cliente?: { nombre: string; apellido?: string }
  profesional?: { nombre: string; color: string }
  servicio?: { nombre: string }
}
interface Props { cita: unknown; onClose: () => void; onSuccess: () => void }

interface Opcion { id: string; nombre: string; apellido?: string; color?: string; precio?: number; duracionMin?: number }

const ESTADOS = ['PENDIENTE','CONFIRMADA','EN_CURSO','COMPLETADA','CANCELADA','NO_ASISTIO']
const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', EN_CURSO: 'En curso',
  COMPLETADA: 'Completada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió',
}

export function CitaModal({ cita: citaRaw, onClose, onSuccess }: Props) {
  const cita = citaRaw as Cita | null
  const editando = !!cita?.id

  const [loading, setLoading] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [clientes, setClientes] = useState<Opcion[]>([])
  const [profesionales, setProfesionales] = useState<Opcion[]>([])
  const [servicios, setServicios] = useState<Opcion[]>([])

  const fechaInicio = cita?.fechaInicio ? new Date(cita.fechaInicio) : new Date()
  const fechaFin = cita?.fechaFin ? new Date(cita.fechaFin) : new Date(fechaInicio.getTime() + 3600000)

  const [form, setForm] = useState({
    clienteId:    cita?.clienteId || '',
    profesionalId:cita?.profesionalId || '',
    servicioId:   cita?.servicioId || '',
    fechaInicio:  format(fechaInicio, "yyyy-MM-dd'T'HH:mm"),
    fechaFin:     format(fechaFin, "yyyy-MM-dd'T'HH:mm"),
    estado:       cita?.estado || 'PENDIENTE',
    notas:        cita?.notas || '',
    precioCobrado:cita?.precioCobrado || '',
    pagado:       cita?.pagado || false,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/clients?limit=100').then(r => r.json()),
      fetch('/api/dashboard/professionals').then(r => r.json()),
      fetch('/api/dashboard/services').then(r => r.json()),
    ]).then(([c, p, s]) => {
      if (c.success) setClientes(c.data.clientes)
      if (p.success) setProfesionales(p.data)
      if (s.success) setServicios(s.data)
    })
  }, [])

  // Auto-calcular fecha fin cuando cambia el servicio
  const onServicioChange = (servicioId: string) => {
    const srv = servicios.find(s => s.id === servicioId)
    if (srv?.duracionMin) {
      const inicio = new Date(form.fechaInicio)
      const fin = new Date(inicio.getTime() + srv.duracionMin * 60000)
      const precio = srv.precio || ''
      setForm(f => ({
        ...f,
        servicioId,
        fechaFin: format(fin, "yyyy-MM-dd'T'HH:mm"),
        precioCobrado: precio,
      }))
    } else {
      setForm(f => ({ ...f, servicioId }))
    }
  }

  const guardar = async () => {
    if (!form.clienteId) { toast.error('Selecciona un cliente'); return }
    setLoading(true)
    try {
      const url = editando ? `/api/dashboard/appointments/${cita!.id}` : '/api/dashboard/appointments'
      const method = editando ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          precioCobrado: form.precioCobrado ? Number(form.precioCobrado) : undefined,
          profesionalId: form.profesionalId || undefined,
          servicioId:    form.servicioId    || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) { toast.success(editando ? 'Cita actualizada' : 'Cita creada'); onSuccess() }
      else toast.error(json.error)
    } catch { toast.error('Error') }
    finally { setLoading(false) }
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar esta cita?')) return
    setEliminando(true)
    try {
      const res = await fetch(`/api/dashboard/appointments/${cita!.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) { toast.success('Cita eliminada'); onSuccess() }
      else toast.error(json.error)
    } catch { toast.error('Error') }
    finally { setEliminando(false) }
  }

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-slide-up"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editando ? 'Editar cita' : 'Nueva cita'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Cliente *</label>
            <select value={form.clienteId} onChange={e => set('clienteId', e.target.value)} className="input">
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido || ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Profesional</label>
              <select value={form.profesionalId} onChange={e => set('profesionalId', e.target.value)} className="input">
                <option value="">Sin asignar</option>
                {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Servicio</label>
              <select value={form.servicioId} onChange={e => onServicioChange(e.target.value)} className="input">
                <option value="">Sin servicio</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Inicio *</label>
              <input type="datetime-local" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Fin *</label>
              <input type="datetime-local" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)} className="input">
                {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Precio cobrado</label>
              <input type="number" value={form.precioCobrado} onChange={e => set('precioCobrado', e.target.value)} className="input" placeholder="0" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            <input type="checkbox" id="pagado" checked={form.pagado} onChange={e => set('pagado', e.target.checked)} className="w-4 h-4 rounded" />
            <label htmlFor="pagado" className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              Marcar como pagado
            </label>
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} className="input resize-none" placeholder="Observaciones sobre la cita..." />
          </div>

          <div className="flex gap-3 pt-2">
            {editando && (
              <button onClick={eliminar} disabled={eliminando} className="btn-danger h-10 px-4">
                {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            )}
            <button onClick={onClose} className="btn-secondary flex-1 h-10">Cancelar</button>
            <button onClick={guardar} disabled={loading} className="btn-primary flex-1 h-10">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : editando ? 'Guardar' : 'Crear cita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
