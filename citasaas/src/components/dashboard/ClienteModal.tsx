// src/components/dashboard/ClienteModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Loader2, Plus, Tag } from 'lucide-react'

const schema = z.object({
  nombre:   z.string().min(1, 'Nombre requerido'),
  apellido: z.string().optional(),
  email:    z.string().email('Email inválido').optional().or(z.literal('')),
  celular:  z.string().optional(),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  notas:    z.string().optional(),
  genero:   z.string().optional(),
  fechaNac: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Cliente {
  id: string; nombre: string; apellido?: string; email?: string
  celular?: string; telefono?: string; whatsapp?: string
  notas?: string; etiquetas: string[]
}

interface Props {
  cliente: Cliente | null
  onClose: () => void
  onSuccess: () => void
}

export function ClienteModal({ cliente, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [etiquetas, setEtiquetas] = useState<string[]>(cliente?.etiquetas || [])
  const [tagInput, setTagInput] = useState('')
  const editando = !!cliente

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: cliente
      ? { nombre: cliente.nombre, apellido: cliente.apellido || '', email: cliente.email || '', celular: cliente.celular || '', telefono: cliente.telefono || '', whatsapp: cliente.whatsapp || '', notas: cliente.notas || '' }
      : {},
  })

  const agregarTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!etiquetas.includes(tagInput.trim())) setEtiquetas(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const url = editando ? `/api/dashboard/clients/${cliente!.id}` : '/api/dashboard/clients'
      const method = editando ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, etiquetas }),
      })
      const json = await res.json()
      if (json.success) { toast.success(editando ? 'Cliente actualizado' : 'Cliente creado'); onSuccess() }
      else toast.error(json.error || 'Error al guardar')
    } catch { toast.error('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 animate-slide-up"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editando ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input {...register('nombre')} className="input" placeholder="Juan" />
              {errors.nombre && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="label">Apellido</label>
              <input {...register('apellido')} className="input" placeholder="Pérez" />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="juan@email.com" />
            {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Celular</label>
              <input {...register('celular')} className="input" placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input {...register('whatsapp')} className="input" placeholder="+57 300 000 0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Género</label>
              <select {...register('genero')} className="input">
                <option value="">Sin especificar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input {...register('fechaNac')} type="date" className="input" />
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="label">Etiquetas</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {etiquetas.map(tag => (
                <span key={tag} className="badge-brand flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => setEtiquetas(prev => prev.filter(t => t !== tag))} className="ml-1 hover:opacity-70">×</button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={agregarTag}
                className="input pl-8 text-sm"
                placeholder="Escribe una etiqueta y presiona Enter..."
              />
            </div>
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea {...register('notas')} rows={3} className="input resize-none" placeholder="Observaciones sobre el cliente..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : editando ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
