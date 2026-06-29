// src/app/superadmin/reportes/page.tsx
export default function ReportesAdminPage() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Reportes globales</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Análisis de todas las empresas del sistema</p>
      </div>
      <div className="card p-12 text-center">
        <p className="text-4xl mb-4">📊</p>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Reportes avanzados</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Disponible en la Fase 3 del desarrollo</p>
      </div>
    </div>
  )
}
