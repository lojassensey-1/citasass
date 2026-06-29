// src/app/superadmin/cupones/page.tsx
export default function CuponesPage() {
  return (
    <div className="flex-1 p-6">
      <div className="h-16 flex items-center px-0 mb-6">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Cupones de descuento</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Crea y gestiona cupones para tus clientes</p>
        </div>
      </div>
      <div className="card p-12 text-center">
        <p className="text-4xl mb-4">🏷️</p>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Módulo de cupones</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Disponible en la Fase 3 del desarrollo</p>
      </div>
    </div>
  )
}
