// src/app/dashboard/configuracion/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Loader2, Building2, Bell, Shield, CreditCard } from 'lucide-react'

interface EmpresaConfig {
  nombre: string; email: string; telefono?: string; sitioWeb?: string
  pais?: string; ciudad?: string; direccion?: string
  timezone: string; moneda: string; idioma: string; colorPrimario: string
}

const TABS = [
  { id: 'empresa',    label: 'Mi empresa',   icon: Building2  },
  { id: 'notif',      label: 'Notificaciones', icon: Bell     },
  { id: 'seguridad',  label: 'Seguridad',    icon: Shield     },
  { id: 'plan',       label: 'Plan y factura', icon: CreditCard },
]

const TIMEZONES = [
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires',
  'America/Mexico_City', 'America/Caracas', 'America/Guayaquil',
]
const MONEDAS = ['COP', 'USD', 'PEN', 'CLP', 'ARS', 'MXN', 'VES']
const IDIOMAS = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]

export default function ConfiguracionPage() {
  const [tab, setTab] = useState('empresa')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [empresa, setEmpresa] = useState<EmpresaConfig | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmpresaConfig>()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          const emp = j.data.empresa
          setEmpresa(emp)
          reset(emp)
        }
        setLoading(false)
      })
  }, [reset])

  const guardar = async (data: EmpresaConfig) => {
    setGuardando(true)
    try {
      const me = await fetch('/api/auth/me').then(r => r.json())
      const empresaId = me.data?.empresa?.id
      const res = await fetch(`/api/dashboard/company`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) toast.success('Configuración guardada')
      else toast.error(json.error || 'Error al guardar')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Header titulo="Configuración" subtitulo="Ajusta tu empresa y preferencias" />

      <div className="flex-1 p-6 animate-fade-in">
        <div className="flex gap-6">
          {/* Tabs lateral */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: tab === t.id ? 'var(--brand-light)' : 'transparent',
                    color: tab === t.id ? 'var(--brand-text)' : 'var(--text-secondary)',
                    fontWeight: tab === t.id ? 500 : 400,
                  }}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido del tab */}
          <div className="flex-1 max-w-2xl">
            {loading ? (
              <div className="card p-6 flex items-center justify-center h-64">
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              </div>
            ) : tab === 'empresa' ? (
              <div className="card p-6">
                <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                  Información del negocio
                </h2>
                <form onSubmit={handleSubmit(guardar)} className="space-y-4">
                  <div>
                    <label className="label">Nombre del negocio *</label>
                    <input {...register('nombre', { required: 'Requerido' })} className="input" />
                    {errors.nombre && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.nombre.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Email de contacto</label>
                      <input {...register('email')} type="email" className="input" />
                    </div>
                    <div>
                      <label className="label">Teléfono</label>
                      <input {...register('telefono')} className="input" placeholder="+57 300 000 0000" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Sitio web</label>
                    <input {...register('sitioWeb')} className="input" placeholder="https://minegocio.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">País</label>
                      <input {...register('pais')} className="input" placeholder="Colombia" />
                    </div>
                    <div>
                      <label className="label">Ciudad</label>
                      <input {...register('ciudad')} className="input" placeholder="Bogotá" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Dirección</label>
                    <input {...register('direccion')} className="input" placeholder="Calle 123 # 45-67" />
                  </div>

                  <div className="pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-sm font-medium mb-3 pt-3" style={{ color: 'var(--text-primary)' }}>
                      Preferencias regionales
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="label">Zona horaria</label>
                        <select {...register('timezone')} className="input">
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.split('/')[1]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Moneda</label>
                        <select {...register('moneda')} className="input">
                          {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Idioma</label>
                        <select {...register('idioma')} className="input">
                          {IDIOMAS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Color principal de la marca</label>
                    <div className="flex items-center gap-3">
                      <input {...register('colorPrimario')} type="color" className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border)', padding: '2px' }} />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Se usa en la agenda y emails</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={guardando} className="btn-primary">
                      {guardando ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            ) : tab === 'notif' ? (
              <div className="card p-6">
                <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                  Notificaciones
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Recordatorio por email', desc: 'Enviar email de recordatorio antes de la cita', key: 'emailRecordatorio' },
                    { label: 'Confirmación automática', desc: 'Confirmar cita automáticamente al crearla', key: 'confirmAuto' },
                    { label: 'Alerta de cancelación', desc: 'Notificar al profesional cuando se cancele una cita', key: 'alertaCancelacion' },
                    { label: 'Resumen diario', desc: 'Recibir resumen de citas del día cada mañana', key: 'resumenDiario' },
                  ].map(({ label, desc, key }) => (
                    <div key={key} className="flex items-start justify-between p-4 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 mt-1 rounded" style={{ accentColor: 'var(--brand)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : tab === 'seguridad' ? (
              <div className="card p-6">
                <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                  Seguridad
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Contraseña actual</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">Nueva contraseña</label>
                    <input type="password" className="input" placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div>
                    <label className="label">Confirmar nueva contraseña</label>
                    <input type="password" className="input" placeholder="Repite la contraseña" />
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary">Cambiar contraseña</button>
                  </div>
                  <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Autenticación de dos factores</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Añade una capa extra de seguridad</p>
                      </div>
                      <span className="badge-gray">Próximamente</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
                  Plan y facturación
                </h2>
                <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--brand-light)', border: '1px solid rgba(79,103,255,0.2)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>Plan actual: Período de prueba</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--brand-text)', opacity: 0.8 }}>Accede a todas las funciones durante tu trial</p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Para contratar o cambiar tu plan, contacta a soporte o accede al portal de facturación.
                </p>
                <button className="btn-primary mt-4">Ver planes disponibles</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
