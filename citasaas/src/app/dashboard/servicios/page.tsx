// src/app/dashboard/servicios/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ServicioModal } from '@/components/dashboard/ServicioModal'
import { formatCurrency } from '@/lib/utils'

interface Servicio {
  id: string; nombre: string; descripcion?: string; precio: number
  duracionMin: number; color: string; activo: boolean; categoria?: string
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)

  const cargar = async () => {
    setLoading(true)
    const res = await fetch('/api/dashboard/services')
    const json = await res.json()
    if (json.success) setServicios(json.data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el servicio "${nombre}"?`)) return
    const res = await fetch(`/api/dashboard/services/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Servicio eliminado'); cargar() }
    else toast.error(json.error)
  }

  const categorias = [...new Set(servicios.map(s => s.categoria || 'Sin categoría'))]

  return (
    <>
      <Header
        titulo="Servicios"
        subtitulo={`${servicios.length} servicio${servicios.length !== 1 ? 's' : ''} configurados`}
        accion={{ label: 'Nuevo servicio', onClick: () => { setEditando(null); setModalOpen(true) } }}
      />

      <div className="flex-1 p-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="h-5 rounded animate-pulse" style={{ background: 'var(--border)' }} />
                <div className="h-4 rounded animate-pulse w-2/3" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        ) : servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-subtle)' }}>
              <Scissors size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Sin servicios aún</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Agrega los servicios que ofrece tu negocio</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={15} /> Agregar servicio</button>
          </div>
        ) : (
          <div className="space-y-6">
            {categorias.map(cat => {
              const items = servicios.filter(s => (s.categoria || 'Sin categoría') === cat)
              return (
                <div key={cat}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(srv => (
                      <div
                        key={srv.id}
                        className="card p-5 group hover:shadow-md transition-all duration-200"
                        style={{ borderLeft: `4px solid ${srv.color}` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{srv.nombre}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditando(srv); setModalOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]" style={{ color: 'var(--text-muted)' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => eliminar(srv.id, srv.nombre)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle]" style={{ color: 'var(--danger)' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        {srv.descripcion && (
                          <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{srv.descripcion}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: srv.color }}>
                            <DollarSign size={14} />
                            {formatCurrency(srv.precio)}
                          </div>
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={12} />
                            {srv.duracionMin} min
                          </div>
                        </div>
                        {!srv.activo && <span className="badge-gray mt-2 text-xs">Inactivo</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <ServicioModal
          servicio={editando}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); cargar() }}
        />
      )}
    </>
  )
}
