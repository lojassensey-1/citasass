// src/components/superadmin/EmpresaModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Loader2 } from 'lucide-react'

const schema = z.object({
  nombre:    z.string().min(2, 'Nombre requerido'),
  email:     z.string().email('Email inválido'),
  telefono:  z.string().optional(),
  planId:    z.string().optional(),
  estado:    z.enum(['TRIAL','ACTIVA','SUSPENDIDA','CANCELADA','VENCIDA']).optional(),
  trialDias: z.coerce.number().min(0).max(365).optional(),
})
type FormData = z.infer<typeof schema>

interface Plan { id: string; nombre: string; precio: number }
interface Empresa { id: string; nombre: string; email: string; telefono?: string; estado: string; planId?: string }

interface Props {
  empresa: Empresa | null
  onClose: () => void
  onSuccess: () => void
}

export function EmpresaModal({ empresa, onClose, onSuccess }: Props) {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const editando = !!empresa

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: empresa
      ? { nombre: empresa.nombre, email: empresa.email, telefono: empresa.telefono || '', estado: empresa.estado as never, planId: empresa.planId || '' }
      : { trialDias: 7 },
  })

  useEffect(() => {
    fetch('/api/superadmin/plans')
      .then(r => r.json())
      .then(j => { if (j.success) setPlanes(j.data) })
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const url = editando ? `/api/superadmin/companies/${empresa!.id}` : '/api/superadmin/companies'
      const method = editando ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editando ? 'Empresa actualizada' : 'Empresa creada')
        onSuccess()
      } else {
        toast.error(json.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl p-6 animate-slide-up" style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editando ? 'Editar empresa' : 'Nueva empresa'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre del negocio *</label>
            <input {...register('nombre')} className="input" placeholder="Clínica Dental San Marcos" />
            {errors.nombre && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="label">Email de contacto *</label>
            <input {...register('email')} type="email" className="input" placeholder="admin@negocio.com" />
            {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input {...register('telefono')} className="input" placeholder="+57 300 000 0000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Plan</label>
              <select {...register('planId')} className="input">
                <option value="">Sin plan</option>
                {planes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — ${p.precio}/mes</option>
                ))}
              </select>
            </div>

            {editando ? (
              <div>
                <label className="label">Estado</label>
                <select {...register('estado')} className="input">
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVA">Activa</option>
                  <option value="SUSPENDIDA">Suspendida</option>
                  <option value="VENCIDA">Vencida</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="label">Días de trial</label>
                <input {...register('trialDias')} type="number" min="0" max="365" className="input" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : editando ? 'Guardar cambios' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
