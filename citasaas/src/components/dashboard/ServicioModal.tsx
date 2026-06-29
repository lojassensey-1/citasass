// src/components/dashboard/ServicioModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Loader2 } from 'lucide-react'
import { COLORES_PROFESIONALES } from '@/lib/utils'

const schema = z.object({
  nombre:      z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  precio:      z.coerce.number().min(0, 'Precio inválido'),
  duracionMin: z.coerce.number().min(5, 'Mínimo 5 minutos'),
  color:       z.string().optional(),
  categoria:   z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Servicio { id: string; nombre: string; descripcion?: string; precio: number; duracionMin: number; color: string; categoria?: string }
interface Props { servicio: Servicio | null; onClose: () => void; onSuccess: () => void }

export function ServicioModal({ servicio, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [colorSel, setColorSel] = useState(servicio?.color || COLORES_PROFESIONALES[0])
  const editando = !!servicio

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: servicio
      ? { nombre: servicio.nombre, descripcion: servicio.descripcion || '', precio: servicio.precio, duracionMin: servicio.duracionMin, categoria: servicio.categoria || '' }
      : { precio: 0, duracionMin: 60 },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const url = editando ? `/api/dashboard/services/${servicio!.id}` : '/api/dashboard/services'
      const method = editando ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, color: colorSel }),
      })
      const json = await res.json()
      if (json.success) { toast.success(editando ? 'Servicio actualizado' : 'Servicio creado'); onSuccess() }
      else toast.error(json.error)
    } catch { toast.error('Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl p-6 animate-slide-up" style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{editando ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input {...register('nombre')} className="input" placeholder="Ej: Consulta general" />
            {errors.nombre && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea {...register('descripcion')} rows={2} className="input resize-none" placeholder="Descripción breve del servicio..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Precio *</label>
              <input {...register('precio')} type="number" step="0.01" className="input" placeholder="0" />
              {errors.precio && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.precio.message}</p>}
            </div>
            <div>
              <label className="label">Duración (minutos) *</label>
              <input {...register('duracionMin')} type="number" className="input" placeholder="60" />
              {errors.duracionMin && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.duracionMin.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Categoría</label>
            <input {...register('categoria')} className="input" placeholder="Ej: Tratamientos, Consultas..." />
          </div>

          <div>
            <label className="label">Color en agenda</label>
            <div className="flex gap-2 flex-wrap">
              {COLORES_PROFESIONALES.map(c => (
                <button
                  key={c} type="button" onClick={() => setColorSel(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: colorSel === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : editando ? 'Guardar' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
