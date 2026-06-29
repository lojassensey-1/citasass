// src/app/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/helpers'

export default async function Home() {
  const session = await getSession()
  if (session) {
    if (session.isSuperAdmin) redirect('/superadmin')
    redirect('/dashboard')
  }
  redirect('/auth/login')
}
