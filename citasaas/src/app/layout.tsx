// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    template: '%s | CitaSaaS',
    default: 'CitaSaaS - Gestión de citas para tu negocio',
  },
  description:
    'Plataforma multi-empresa para gestión de citas, agenda, clientes y profesionales.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light'
                if (theme === 'dark') document.documentElement.classList.add('dark')
              } catch {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  )
}
