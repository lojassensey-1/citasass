// src/app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  nombreEmpresa: z.string().min(2, 'Nombre del negocio requerido'),
  nombre: z.string().min(2, 'Tu nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula')
    .regex(/[0-9]/, 'Debe incluir un número'),
  telefono: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')
  const checks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    number:   /[0-9]/.test(password),
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Error al crear la cuenta')
        return
      }

      toast.success(json.message || '¡Cuenta creada! Tu prueba comienza ahora.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Crear cuenta gratis
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          7 días de prueba sin tarjeta de crédito.{' '}
          <Link href="/auth/login" className="font-medium" style={{ color: 'var(--brand)' }}>
            Ya tengo cuenta
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nombre del negocio</label>
          <input
            {...register('nombreEmpresa')}
            placeholder="Ej: Clínica Dental Sonrisas"
            className="input"
          />
          {errors.nombreEmpresa && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.nombreEmpresa.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">Tu nombre</label>
          <input {...register('nombre')} placeholder="Juan Pérez" className="input" />
          {errors.nombre && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">Correo electrónico</label>
          <input
            {...register('email')}
            type="email"
            placeholder="juan@negocio.com"
            className="input"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">Teléfono (opcional)</label>
          <input {...register('telefono')} placeholder="+57 300 000 0000" className="input" />
        </div>

        <div>
          <label className="label">Contraseña</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Indicadores de contraseña */}
          {password && (
            <div className="mt-2 flex gap-3">
              {[
                { ok: checks.length, label: '8+ caracteres' },
                { ok: checks.upper,  label: 'Mayúscula' },
                { ok: checks.number, label: 'Número' },
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <CheckCircle2
                    size={12}
                    style={{ color: ok ? 'var(--success)' : 'var(--text-muted)' }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: ok ? 'var(--success)' : 'var(--text-muted)' }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full h-11 mt-2">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creando tu cuenta...
            </>
          ) : (
            'Comenzar prueba gratis →'
          )}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Al crear una cuenta aceptas nuestros{' '}
          <Link href="/terminos" style={{ color: 'var(--brand)' }}>
            Términos de uso
          </Link>
        </p>
      </form>
    </div>
  )
}
