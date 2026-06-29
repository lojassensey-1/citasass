// src/app/superadmin/usuarios/page.tsx
export default function UsuariosAdminPage() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Usuarios del sistema</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Administradores de todas las empresas</p>
      </div>
      <div className="card p-12 text-center">
        <p className="text-4xl mb-4">👥</p>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Gestión de usuarios</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Disponible en la Fase 2 del desarrollo</p>
      </div>
    </div>
  )
}
