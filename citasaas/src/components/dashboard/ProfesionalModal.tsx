// src/components/dashboard/ProfesionalModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Loader2 } from 'lucide-react'
import { COLORES_PROFESIONALES } from '@/lib/utils'

const schema = z.object({
  nombre:       z.string().min(1, 'Nombre requerido'),
  apellido:     z.string().optional(),
  especialidad: z.string().optional(),
  email:        z.string().email('Email inválido').optional().or(z.literal('')),
  telefono:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Profesional {
  id: string; nombre: string; apellido?: string; especialidad?: string
  email?: string; telefono?: string; color: string; activo: boolean
}
interface Props { profesional: Profesional | null; onClose: () => void; onSuccess: () => void }

export function ProfesionalModal({ profesional, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState(profesional?.color || COLORES_PROFESIONALES[0])
  const editando = !!profesional

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: profesional
      ? {
          nombre: profesional.nombre,
          apellido: profesional.apellido || '',
          especialidad: profesional.especialidad || '',
          email: profesional.email || '',
          telefono: profesional.telefono || '',
        }
      : {},
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const url = editando
        ? `/api/dashboard/professionals/${profesional!.id}`
        : '/api/dashboard/professionals'
      const method = editando ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, color, email: data.email || null }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editando ? 'Profesional actualizado' : 'Profesional creado')
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 animate-slide-up"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editando ? 'Editar profesional' : 'Nuevo profesional'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input {...register('nombre')} className="input" placeholder="María" />
              {errors.nombre && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label className="label">Apellido</label>
              <input {...register('apellido')} className="input" placeholder="González" />
            </div>
          </div>

          <div>
            <label className="label">Especialidad</label>
            <input
              {...register('especialidad')}
              className="input"
              placeholder="Ej: Odontología, Estética, Fisioterapia..."
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="profesional@empresa.com" />
            {errors.email && (
              <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input {...register('telefono')} className="input" placeholder="+57 300 000 0000" />
          </div>

          {/* Selector de color */}
          <div>
            <label className="label">Color en agenda</label>
            <div className="flex gap-2 flex-wrap">
              {COLORES_PROFESIONALES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {color === c && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : editando ? 'Guardar cambios' : 'Crear profesional'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
