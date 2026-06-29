// src/components/layout/Header.tsx
'use client'

import { Search, Plus } from 'lucide-react'

interface HeaderProps {
  titulo: string
  subtitulo?: string
  accion?: { label: string; onClick: () => void }
}

export function Header({ titulo, subtitulo, accion }: HeaderProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitulo}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Búsqueda */}
        <div className="relative hidden md:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="input pl-9 h-9 w-56 text-sm"
          />
        </div>

        {/* Botón de acción */}
        {accion && (
          <button onClick={accion.onClick} className="btn-primary h-9">
            <Plus size={15} />
            {accion.label}
          </button>
        )}
      </div>
    </header>
  )
}
