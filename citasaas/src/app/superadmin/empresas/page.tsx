// src/app/superadmin/empresas/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Building2, Plus, Search, MoreVertical, Edit2, Trash2, Ban, CheckCircle, ExternalLink } from 'lucide-react'
import { EmpresaModal } from '@/components/superadmin/EmpresaModal'
import { formatRelative } from '@/lib/utils'

const ESTADOS = [
  { value: '',           label: 'Todos' },
  { value: 'TRIAL',      label: 'Trial' },
  { value: 'ACTIVA',     label: 'Activas' },
  { value: 'SUSPENDIDA', label: 'Suspendidas' },
  { value: 'VENCIDA',    label: 'Vencidas' },
]

const estadoBadge: Record<string, string> = {
  TRIAL:      'badge-yellow',
  ACTIVA:     'badge-green',
  SUSPENDIDA: 'badge-red',
  VENCIDA:    'badge-gray',
  CANCELADA:  'badge-gray',
}
const estadoLabel: Record<string, string> = {
  TRIAL: 'Trial', ACTIVA: 'Activa', SUSPENDIDA: 'Suspendida', VENCIDA: 'Vencida', CANCELADA: 'Cancelada',
}

interface Empresa {
  id: string; nombre: string; slug: string; email: string; estado: string
  trialEndsAt?: string; createdAt: string
  plan?: { nombre: string; precio: number }
  _count: { usuarios: number; clientes: number; citas: number }
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Empresa | null>(null)
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, estado, page: String(page), limit: '15' })
      const res = await fetch(`/api/superadmin/companies?${params}`)
      const json = await res.json()
      if (json.success) {
        setEmpresas(json.data.empresas)
        setTotal(json.data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [q, estado, page])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const res = await fetch(`/api/superadmin/companies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    const json = await res.json()
    if (json.success) { toast.success('Estado actualizado'); cargar() }
    else toast.error(json.error)
    setMenuAbierto(null)
  }

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar permanentemente "${nombre}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Empresa eliminada'); cargar() }
    else toast.error(json.error)
    setMenuAbierto(null)
  }

  const pages = Math.ceil(total / 15)

  return (
    <>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Empresas</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} empresa{total !== 1 ? 's' : ''} registradas</p>
        </div>
        <button onClick={() => { setEditando(null); setModalOpen(true) }} className="btn-primary h-9">
          <Plus size={15} /> Nueva empresa
        </button>
      </div>

      <div className="flex-1 p-6 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Buscar por nombre o email..." className="input pl-9" />
          </div>
          <div className="flex gap-2">
            {ESTADOS.map(e => (
              <button
                key={e.value}
                onClick={() => { setEstado(e.value); setPage(1) }}
                className="btn h-10 text-xs"
                style={{
                  background: estado === e.value ? 'var(--brand)' : 'var(--bg-subtle)',
                  color: estado === e.value ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${estado === e.value ? 'var(--brand)' : 'var(--border)'}`,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  {['Empresa', 'Plan', 'Estado', 'Usuarios', 'Clientes', 'Citas', 'Creada', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border)', width: j === 0 ? '140px' : '60px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : empresas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No se encontraron empresas
                    </td>
                  </tr>
                ) : (
                  empresas.map(emp => (
                    <tr
                      key={emp.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="hover:bg-[--bg-subtle] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--brand)' }}>
                            {emp.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.nombre}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{emp.plan?.nombre || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={estadoBadge[emp.estado] || 'badge-gray'}>{estadoLabel[emp.estado] || emp.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{emp._count.usuarios}</td>
                      <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{emp._count.clientes}</td>
                      <td className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{emp._count.citas}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(emp.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setMenuAbierto(menuAbierto === emp.id ? null : emp.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--bg-subtle] transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <MoreVertical size={15} />
                          </button>
                          {menuAbierto === emp.id && (
                            <div
                              className="absolute right-0 top-9 w-48 rounded-xl py-1 z-50 animate-fade-in"
                              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                            >
                              <button
                                onClick={() => { setEditando(emp); setModalOpen(true); setMenuAbierto(null) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-subtle] transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                <Edit2 size={14} /> Editar
                              </button>
                              <a
                                href={`/dashboard`}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-subtle] transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                <ExternalLink size={14} /> Entrar como admin
                              </a>
                              {emp.estado !== 'ACTIVA' && (
                                <button
                                  onClick={() => cambiarEstado(emp.id, 'ACTIVA')}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-subtle] transition-colors"
                                  style={{ color: 'var(--success)' }}
                                >
                                  <CheckCircle size={14} /> Activar
                                </button>
                              )}
                              {emp.estado !== 'SUSPENDIDA' && (
                                <button
                                  onClick={() => cambiarEstado(emp.id, 'SUSPENDIDA')}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-subtle] transition-colors"
                                  style={{ color: 'var(--warning)' }}
                                >
                                  <Ban size={14} /> Suspender
                                </button>
                              )}
                              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                              <button
                                onClick={() => eliminar(emp.id, emp.nombre)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[--bg-subtle] transition-colors"
                                style={{ color: 'var(--danger)' }}
                              >
                                <Trash2 size={14} /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Página {page} de {pages}
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary h-8 text-xs px-3 disabled:opacity-40">Anterior</button>
                <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary h-8 text-xs px-3 disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <EmpresaModal
          empresa={editando}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); cargar() }}
        />
      )}
    </>
  )
}
