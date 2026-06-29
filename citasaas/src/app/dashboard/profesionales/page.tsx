// src/app/dashboard/profesionales/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { UserCheck, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ProfesionalModal } from '@/components/dashboard/ProfesionalModal'
import { getInitials } from '@/lib/utils'

interface Profesional {
  id: string; nombre: string; apellido?: string; especialidad?: string
  email?: string; telefono?: string; color: string; activo: boolean
  sucursal?: { nombre: string }
  _count: { citas: number }
}

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Profesional | null>(null)

  const cargar = async () => {
    setLoading(true)
    const res = await fetch('/api/dashboard/professionals')
    const json = await res.json()
    if (json.success) setProfesionales(json.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    const res = await fetch(`/api/dashboard/professionals/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Profesional eliminado'); cargar() }
    else toast.error(json.error)
  }

  return (
    <>
      <Header
        titulo="Profesionales"
        subtitulo={`${profesionales.length} profesional${profesionales.length !== 1 ? 'es' : ''} registrados`}
        accion={{ label: 'Nuevo profesional', onClick: () => { setEditando(null); setModalOpen(true) } }}
      />

      <div className="flex-1 p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: 'var(--border)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border)', width: '60%' }} />
                    <div className="h-3 rounded animate-pulse" style={{ background: 'var(--border)', width: '40%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : profesionales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-subtle)' }}>
              <UserCheck size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Sin profesionales aún</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Agrega los profesionales que trabajan en tu negocio</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={15} /> Agregar profesional
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profesionales.map(prof => {
              const nombre = [prof.nombre, prof.apellido].filter(Boolean).join(' ')
              return (
                <div key={prof.id} className="card p-5 group hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ background: prof.color }}
                      >
                        {getInitials(nombre)}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nombre}</p>
                        {prof.especialidad && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{prof.especialidad}</p>
                        )}
                        {prof.sucursal && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{prof.sucursal.nombre}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditando(prof); setModalOpen(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => eliminar(prof.id, nombre)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-4">
                    {prof.email && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Mail size={11} />
                        <span className="truncate">{prof.email}</span>
                      </div>
                    )}
                    {prof.telefono && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Phone size={11} />
                        {prof.telefono}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {prof._count.citas} cita{prof._count.citas !== 1 ? 's' : ''} totales
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: prof.activo ? 'var(--success-light)' : 'var(--bg-subtle)',
                        color: prof.activo ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      {prof.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProfesionalModal
          profesional={editando}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); cargar() }}
        />
      )}
    </>
  )
}
