// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  LayoutDashboard, CalendarDays, Users, UserCheck,
  Scissors, BarChart3, Settings, LogOut, Building2,
  ChevronRight, Bell, Moon, Sun,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Inicio'         },
  { href: '/dashboard/agenda',         icon: CalendarDays,    label: 'Agenda'         },
  { href: '/dashboard/clientes',       icon: Users,           label: 'Clientes'       },
  { href: '/dashboard/profesionales',  icon: UserCheck,       label: 'Profesionales'  },
  { href: '/dashboard/servicios',      icon: Scissors,        label: 'Servicios'      },
  { href: '/dashboard/reportes',       icon: BarChart3,       label: 'Reportes'       },
  { href: '/dashboard/configuracion',  icon: Settings,        label: 'Configuración'  },
]

interface SidebarProps {
  empresa: { nombre: string; slug: string; estado: string; trialEndsAt?: Date | null }
  usuario: { nombre: string; email: string; rol: string }
}

export function Sidebar({ empresa, usuario }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const next = !dark
    html.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Sesión cerrada')
    router.push('/auth/login')
    router.refresh()
  }

  // Banner de trial
  const trialEnd = empresa.trialEndsAt ? new Date(empresa.trialEndsAt) : null
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000))
    : null

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'var(--brand)' }}
        >
          C
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{empresa.nombre}</p>
          <p className="text-xs truncate" style={{ color: 'var(--sidebar-text)' }}>
            {empresa.slug}
          </p>
        </div>
      </div>

      {/* Trial banner */}
      {empresa.estado === 'TRIAL' && daysLeft !== null && (
        <div className="mx-3 mt-3 rounded-xl p-3" style={{ background: 'rgba(79,103,255,0.15)' }}>
          <p className="text-xs font-medium" style={{ color: '#728eff' }}>
            {daysLeft > 0
              ? `⏱ ${daysLeft} día${daysLeft !== 1 ? 's' : ''} de prueba restantes`
              : '⚠ Tu período de prueba ha terminado'}
          </p>
          <Link
            href="/dashboard/planes"
            className="text-xs mt-1 block"
            style={{ color: '#9cb4ff' }}
          >
            Contratar plan →
          </Link>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'font-medium'
                  : 'hover:bg-white/5'
              )}
              style={{
                background: active ? 'var(--sidebar-active-bg)' : undefined,
                color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
              }}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} style={{ color: 'var(--brand)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="border-t border-white/5 p-3 space-y-1">
        {/* Acciones */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--sidebar-text)' }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <Bell size={16} />
          </button>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: 'var(--brand)' }}
          >
            {getInitials(usuario.nombre)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{usuario.nombre}</p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-text)', fontSize: '10px' }}>
              {usuario.rol}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="hover:text-white transition-colors"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
