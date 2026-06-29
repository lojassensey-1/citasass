// src/app/dashboard/clientes/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Users, Plus, Search, Phone, Mail, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ClienteModal } from '@/components/dashboard/ClienteModal'
import { formatRelative, getInitials } from '@/lib/utils'

interface Cliente {
  id: string; nombre: string; apellido?: string; email?: string
  celular?: string; telefono?: string; estado: string; etiquetas: string[]
  createdAt: string; _count: { citas: number }
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [menu, setMenu] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, page: String(page), limit: '20' })
      const res = await fetch(`/api/dashboard/clients?${params}`)
      const json = await res.json()
      if (json.success) { setClientes(json.data.clientes); setTotal(json.data.total) }
    } finally { setLoading(false) }
  }, [q, page])

  useEffect(() => { cargar() }, [cargar])

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    const res = await fetch(`/api/dashboard/clients/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Cliente eliminado'); cargar() }
    else toast.error(json.error)
    setMenu(null)
  }

  const pages = Math.ceil(total / 20)

  return (
    <>
      <Header
        titulo="Clientes"
        subtitulo={`${total} cliente${total !== 1 ? 's' : ''} registrados`}
        accion={{ label: 'Nuevo cliente', onClick: () => { setEditando(null); setModalOpen(true) } }}
      />

      <div className="flex-1 p-6 animate-fade-in">
        {/* Buscador */}
        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={q} onChange={e => { setQ(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre, email o teléfono..."
            className="input pl-9"
          />
        </div>

        {/* Grid de clientes */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'var(--border)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border)', width: '70%' }} />
                    <div className="h-3 rounded animate-pulse" style={{ background: 'var(--border)', width: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-subtle)' }}>
              <Users size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {q ? 'Sin resultados' : 'Sin clientes aún'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {q ? 'Prueba con otro término' : 'Agrega tu primer cliente para comenzar'}
            </p>
            {!q && (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus size={15} /> Agregar cliente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clientes.map(cli => {
              const nombre = [cli.nombre, cli.apellido].filter(Boolean).join(' ')
              return (
                <div key={cli.id} className="card p-4 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ background: 'var(--brand)' }}
                      >
                        {getInitials(nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{nombre}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {cli._count.citas} cita{cli._count.citas !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenu(menu === cli.id ? null : cli.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[--bg-subtle]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menu === cli.id && (
                        <div
                          className="absolute right-0 top-8 w-40 rounded-xl py-1 z-10 animate-fade-in"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                        >
                          <button
                            onClick={() => { setEditando(cli); setModalOpen(true); setMenu(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[--bg-subtle]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Edit2 size={12} /> Editar
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[--bg-subtle]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Calendar size={12} /> Nueva cita
                          </button>
                          <button
                            onClick={() => eliminar(cli.id, nombre)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[--bg-subtle]"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {cli.celular && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Phone size={11} /> {cli.celular}
                      </div>
                    )}
                    {cli.email && (
                      <div className="flex items-center gap-2 text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        <Mail size={11} /> <span className="truncate">{cli.email}</span>
                      </div>
                    )}
                  </div>

                  {cli.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {cli.etiquetas.slice(0, 3).map(tag => (
                        <span key={tag} className="badge-brand text-xs">{tag}</span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    {formatRelative(cli.createdAt)}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary h-9 text-sm disabled:opacity-40">← Anterior</button>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary h-9 text-sm disabled:opacity-40">Siguiente →</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <ClienteModal
          cliente={editando}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); cargar() }}
        />
      )}
    </>
  )
}
