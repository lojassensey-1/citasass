# CitaSaaS — Plataforma Multi-Tenant de Gestión de Citas

Sistema SaaS profesional para gestión de citas, clientes y profesionales.
Multi-empresa, escalable y listo para producción.

---

## 🚀 Instalación paso a paso

### 1. Requisitos previos

- **Node.js** 18 o superior → https://nodejs.org
- **PostgreSQL** 14 o superior → https://postgresql.org
  - En Mac: `brew install postgresql && brew services start postgresql`
  - En Windows: descarga desde postgresql.org
  - En Ubuntu: `sudo apt install postgresql postgresql-contrib`

### 2. Instalar dependencias

```bash
cd citasaas
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y configura:

```env
# Base de datos — ajusta usuario, contraseña y nombre
DATABASE_URL="postgresql://postgres:tucontraseña@localhost:5432/citasaas"

# JWT — genera secretos seguros con:
# node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
JWT_SECRET="tu_secreto_muy_largo_aqui"
JWT_REFRESH_SECRET="otro_secreto_diferente_aqui"

# URL de tu app
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Super Admin
SUPER_ADMIN_EMAIL="admin@citasaas.com"
SUPER_ADMIN_PASSWORD="SuperAdmin123!"
```

### 4. Crear la base de datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE citasaas;"

# Generar el cliente Prisma
npm run db:generate

# Crear todas las tablas
npm run db:push
```

### 5. Cargar datos de prueba (seed)

```bash
npm run db:seed
```

Esto crea:
- ✅ Super Admin: `admin@citasaas.com` / `SuperAdmin123!`
- ✅ Admin empresa demo: `admin@demo.com` / `Admin123!`
- ✅ Planes: Básico ($19), Profesional ($49), Premium ($99)
- ✅ Empresa demo con profesionales, servicios y una cita

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre → **http://localhost:3000**

---

## 🔑 Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | admin@citasaas.com | SuperAdmin123! |
| Admin empresa | admin@demo.com | Admin123! |

---

## 📁 Estructura del proyecto

```
citasaas/
├── prisma/
│   ├── schema.prisma     # Esquema de base de datos multi-tenant
│   └── seed.ts           # Datos iniciales
├── src/
│   ├── app/
│   │   ├── auth/         # Login y registro
│   │   ├── dashboard/    # Panel de empresa
│   │   │   ├── agenda/
│   │   │   ├── clientes/
│   │   │   ├── profesionales/
│   │   │   ├── servicios/
│   │   │   ├── reportes/
│   │   │   └── configuracion/
│   │   ├── superadmin/   # Panel Super Admin
│   │   │   ├── empresas/
│   │   │   └── planes/
│   │   └── api/          # APIs REST
│   ├── components/
│   │   ├── layout/       # Sidebar, Header
│   │   ├── dashboard/    # Componentes del panel
│   │   └── superadmin/   # Componentes del SA
│   ├── lib/
│   │   ├── auth/         # JWT, helpers de auth
│   │   ├── prisma.ts     # Cliente DB
│   │   └── utils.ts      # Utilidades
│   ├── middleware.ts      # Protección de rutas
│   └── types/            # Tipos TypeScript
└── .env.example
```

---

## 🏗️ Arquitectura Multi-Tenant

- **Aislamiento por `empresa_id`**: cada tabla de negocio contiene el ID de la empresa propietaria
- **Middleware de autenticación**: verifica token JWT y adjunta contexto de empresa en cada request
- **Validación en API**: cada endpoint verifica que el recurso pertenezca a la empresa del usuario autenticado
- **Super Admin**: token especial que permite acceso a todas las empresas

---

## 📋 Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio (UI para DB)
npm run db:seed      # Cargar datos de prueba
```

---

## 🔧 Solución de problemas

**Error de conexión a la base de datos:**
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready
# o
sudo systemctl status postgresql
```

**Error "prisma not found":**
```bash
npm install prisma --save-dev
npm run db:generate
```

**Error de permisos en la base de datos:**
```sql
-- En psql como superusuario:
GRANT ALL PRIVILEGES ON DATABASE citasaas TO tu_usuario;
```

---

## 🗺️ Roadmap de fases

- ✅ **Fase 1** — Base, autenticación, Super Admin, panel de empresa
- 🔜 **Fase 2** — Agenda avanzada con drag & drop, módulo de usuarios internos
- 🔜 **Fase 3** — Facturación, caja, pagos, cupones
- 🔜 **Fase 4** — WhatsApp, email, notificaciones automáticas
- 🔜 **Fase 5** — IA: asistente de negocio y predicciones
- 🔜 **Fase 6** — Portal público de reservas, suscripciones Stripe
- 🔜 **Fase 7** — PWA, i18n, modo offline, deploy producción
