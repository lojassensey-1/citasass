// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Error al iniciar sesión')
        return
      }

      toast.success('¡Bienvenido!')
      const user = json.data?.usuario
      if (user?.isSuperAdmin) {
        router.push('/superadmin')
      } else {
        router.push('/dashboard')
      }
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
          Iniciar sesión
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-medium" style={{ color: 'var(--brand)' }}>
            Prueba gratis 7 días
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="label">Correo electrónico</label>
          <input
            {...register('email')}
            type="email"
            placeholder="tucorreo@empresa.com"
            className="input"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Contraseña</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs"
              style={{ color: 'var(--brand)' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="input pr-10"
              autoComplete="current-password"
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
          {errors.password && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full h-11">
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div
        className="mt-8 p-4 rounded-xl text-xs space-y-1"
        style={{ background: 'var(--brand-light)', color: 'var(--brand-text)' }}
      >
        <p className="font-semibold mb-2">Credenciales de prueba:</p>
        <p>Admin empresa: <strong>admin@demo.com</strong> / <strong>Admin123!</strong></p>
        <p>Super Admin: <strong>admin@citasaas.com</strong> / <strong>SuperAdmin123!</strong></p>
      </div>
    </div>
  )
}
