// src/components/superadmin/SuperAdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  LayoutDashboard, Building2, CreditCard, Settings,
  LogOut, BarChart3, Tag, Shield, Users, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/superadmin',             icon: LayoutDashboard, label: 'Panel general'   },
  { href: '/superadmin/empresas',    icon: Building2,       label: 'Empresas'        },
  { href: '/superadmin/planes',      icon: CreditCard,      label: 'Planes'          },
  { href: '/superadmin/cupones',     icon: Tag,             label: 'Cupones'         },
  { href: '/superadmin/usuarios',    icon: Users,           label: 'Usuarios'        },
  { href: '/superadmin/reportes',    icon: BarChart3,       label: 'Reportes'        },
  { href: '/superadmin/seguridad',   icon: Shield,          label: 'Seguridad'       },
  { href: '/superadmin/configuracion', icon: Settings,      label: 'Configuración'   },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Sesión cerrada')
    router.push('/auth/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40"
      style={{ background: '#07090f', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-red-600 text-sm flex-shrink-0">
          SA
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Super Admin</p>
          <p className="text-xs text-slate-500">CitaSaaS</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/superadmin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active ? 'font-medium' : 'hover:bg-white/5'
              )}
              style={{
                background: active ? 'rgba(239,68,68,0.15)' : undefined,
                color: active ? '#fca5a5' : '#64748b',
              }}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="text-red-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/5"
          style={{ color: '#64748b' }}
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
