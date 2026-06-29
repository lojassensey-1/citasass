// prisma/seed.ts
// Datos iniciales del sistema: super admin, planes y empresa demo

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // ── 1. Planes ──────────────────────────────────────────
  const planBasico = await prisma.plan.upsert({
    where: { id: 'plan-basico' },
    update: {},
    create: {
      id: 'plan-basico',
      nombre: 'Básico',
      descripcion: 'Perfecto para comenzar',
      precio: 19,
      moneda: 'USD',
      orden: 1,
      limiteUsuarios: 2,
      limiteProfesionales: 3,
      limiteClientes: 100,
      limiteServicios: 10,
      limiteSucursales: 1,
      limiteCitasMes: 100,
      limiteAlmacenMb: 500,
      tieneReportes: false,
      tieneIA: false,
      tieneWhatsApp: false,
    },
  })

  const planPro = await prisma.plan.upsert({
    where: { id: 'plan-profesional' },
    update: {},
    create: {
      id: 'plan-profesional',
      nombre: 'Profesional',
      descripcion: 'Para negocios en crecimiento',
      precio: 49,
      moneda: 'USD',
      orden: 2,
      esPopular: true,
      limiteUsuarios: 10,
      limiteProfesionales: 15,
      limiteClientes: 1000,
      limiteServicios: 50,
      limiteSucursales: 3,
      limiteCitasMes: 1000,
      limiteAlmacenMb: 5000,
      tieneReportes: true,
      tieneWhatsApp: true,
      tieneIA: false,
    },
  })

  const planPremium = await prisma.plan.upsert({
    where: { id: 'plan-premium' },
    update: {},
    create: {
      id: 'plan-premium',
      nombre: 'Premium',
      descripcion: 'Sin límites para empresas grandes',
      precio: 99,
      moneda: 'USD',
      orden: 3,
      tieneReportes: true,
      tieneWhatsApp: true,
      tieneIA: true,
      tieneAPI: true,
      tieneInventario: true,
      tieneSucursales: true,
      tienePersonaliz: true,
    },
  })

  console.log('✓ Planes creados:', planBasico.nombre, planPro.nombre, planPremium.nombre)

  // ── 2. Empresa demo ────────────────────────────────────
  const empresaDemo = await prisma.empresa.upsert({
    where: { slug: 'demo-clinica' },
    update: {},
    create: {
      nombre: 'Clínica Demo',
      slug: 'demo-clinica',
      email: 'demo@clinica.com',
      telefono: '+57 300 000 0000',
      estado: 'TRIAL',
      planId: planPro.id,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      pais: 'Colombia',
      ciudad: 'Bogotá',
    },
  })

  console.log('✓ Empresa demo creada:', empresaDemo.nombre)

  // ── 3. Admin de la empresa demo ────────────────────────
  const hashAdmin = await bcrypt.hash('Admin123!', 12)
  await prisma.usuario.upsert({
    where: { empresaId_email: { empresaId: empresaDemo.id, email: 'admin@demo.com' } },
    update: {},
    create: {
      empresaId: empresaDemo.id,
      email: 'admin@demo.com',
      nombre: 'Admin',
      apellido: 'Demo',
      password: hashAdmin,
      rol: 'ADMIN',
    },
  })

  console.log('✓ Admin demo creado: admin@demo.com / Admin123!')

  // ── 4. Super Admin del sistema ─────────────────────────
  // El super admin se crea con una empresa virtual "sistema"
  const empresaSistema = await prisma.empresa.upsert({
    where: { slug: '__sistema__' },
    update: {},
    create: {
      nombre: 'Sistema',
      slug: '__sistema__',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@citasaas.com',
      estado: 'ACTIVA',
    },
  })

  const hashSuper = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!',
    12
  )
  await prisma.usuario.upsert({
    where: {
      empresaId_email: {
        empresaId: empresaSistema.id,
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@citasaas.com',
      },
    },
    update: {},
    create: {
      empresaId: empresaSistema.id,
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@citasaas.com',
      nombre: 'Super',
      apellido: 'Admin',
      password: hashSuper,
      rol: 'SUPER_ADMIN',
      isSuperAdmin: true,
    },
  })

  console.log(
    '✓ Super Admin creado:',
    process.env.SUPER_ADMIN_EMAIL || 'admin@citasaas.com',
    '/',
    process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!'
  )

  // ── 5. Sucursal principal demo ─────────────────────────
  await prisma.sucursal.upsert({
    where: { id: 'suc-demo-principal' },
    update: {},
    create: {
      id: 'suc-demo-principal',
      empresaId: empresaDemo.id,
      nombre: 'Sede Principal',
      direccion: 'Calle 123 # 45-67',
      telefono: '+57 300 000 0000',
      esMatriz: true,
      horario: {
        lunes:    { abre: '08:00', cierra: '18:00', activo: true },
        martes:   { abre: '08:00', cierra: '18:00', activo: true },
        miercoles:{ abre: '08:00', cierra: '18:00', activo: true },
        jueves:   { abre: '08:00', cierra: '18:00', activo: true },
        viernes:  { abre: '08:00', cierra: '17:00', activo: true },
        sabado:   { abre: '09:00', cierra: '13:00', activo: true },
        domingo:  { abre: null,    cierra: null,     activo: false },
      },
    },
  })

  // ── 6. Profesionales demo ──────────────────────────────
  const prof1 = await prisma.profesional.upsert({
    where: { id: 'prof-demo-1' },
    update: {},
    create: {
      id: 'prof-demo-1',
      empresaId: empresaDemo.id,
      sucursalId: 'suc-demo-principal',
      nombre: 'Dra. María',
      apellido: 'González',
      especialidad: 'Odontología General',
      color: '#4f67ff',
    },
  })

  const prof2 = await prisma.profesional.upsert({
    where: { id: 'prof-demo-2' },
    update: {},
    create: {
      id: 'prof-demo-2',
      empresaId: empresaDemo.id,
      sucursalId: 'suc-demo-principal',
      nombre: 'Dr. Carlos',
      apellido: 'Ruiz',
      especialidad: 'Ortodoncia',
      color: '#10b981',
    },
  })

  console.log('✓ Profesionales demo creados')

  // ── 7. Servicios demo ──────────────────────────────────
  const serv1 = await prisma.servicio.upsert({
    where: { id: 'serv-demo-1' },
    update: {},
    create: {
      id: 'serv-demo-1',
      empresaId: empresaDemo.id,
      nombre: 'Consulta General',
      precio: 50000,
      duracionMin: 30,
      color: '#4f67ff',
      categoria: 'Consultas',
    },
  })

  await prisma.servicio.upsert({
    where: { id: 'serv-demo-2' },
    update: {},
    create: {
      id: 'serv-demo-2',
      empresaId: empresaDemo.id,
      nombre: 'Limpieza Dental',
      precio: 80000,
      duracionMin: 60,
      color: '#10b981',
      categoria: 'Tratamientos',
    },
  })

  // ── 8. Clientes demo ───────────────────────────────────
  const cliente1 = await prisma.cliente.upsert({
    where: { id: 'cli-demo-1' },
    update: {},
    create: {
      id: 'cli-demo-1',
      empresaId: empresaDemo.id,
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana@ejemplo.com',
      celular: '+57 310 000 0001',
      whatsapp: '+57 310 000 0001',
    },
  })

  await prisma.cliente.upsert({
    where: { id: 'cli-demo-2' },
    update: {},
    create: {
      id: 'cli-demo-2',
      empresaId: empresaDemo.id,
      nombre: 'Luis',
      apellido: 'Torres',
      email: 'luis@ejemplo.com',
      celular: '+57 320 000 0002',
    },
  })

  console.log('✓ Clientes demo creados')

  // ── 9. Citas demo ──────────────────────────────────────
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  await prisma.cita.upsert({
    where: { id: 'cita-demo-1' },
    update: {},
    create: {
      id: 'cita-demo-1',
      empresaId: empresaDemo.id,
      clienteId: cliente1.id,
      profesionalId: prof1.id,
      servicioId: serv1.id,
      sucursalId: 'suc-demo-principal',
      fechaInicio: new Date(hoy.getTime() + 9 * 60 * 60 * 1000),
      fechaFin:    new Date(hoy.getTime() + 9.5 * 60 * 60 * 1000),
      estado: 'CONFIRMADA',
      precioCobrado: 50000,
    },
  })

  console.log('✓ Citas demo creadas')
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ Seed completado exitosamente')
  console.log('═══════════════════════════════════════════════════')
  console.log('🔑 Super Admin:  admin@citasaas.com / SuperAdmin123!')
  console.log('🏢 Admin Demo:   admin@demo.com / Admin123!')
  console.log('═══════════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
