// src/app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        {/* Círculos decorativos */}
        <div
          className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4f67ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'var(--brand)' }}
            >
              C
            </div>
            <span className="text-white font-semibold text-xl">CitaSaaS</span>
          </div>
        </div>

        {/* Mensaje central */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Gestiona tu negocio
            <br />
            <span style={{ color: '#728eff' }}>desde un solo lugar</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Agenda, clientes, profesionales y reportes.
            Todo lo que necesitas para hacer crecer tu negocio.
          </p>

          {/* Features */}
          {[
            'Agenda inteligente con vista diaria, semanal y mensual',
            'Recordatorios automáticos por WhatsApp y email',
            'Reportes e insights de tu negocio en tiempo real',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-4">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(79,103,255,0.25)' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#728eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            Usado por +500 negocios en América Latina
          </p>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--brand)' }}
            >
              C
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              CitaSaaS
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
