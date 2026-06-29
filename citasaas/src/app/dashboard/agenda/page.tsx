// src/app/dashboard/agenda/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { AgendaCalendario } from '@/components/dashboard/AgendaCalendario'
import { CitaModal } from '@/components/dashboard/CitaModal'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default function AgendaPage() {
  const [citas, setCitas] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [fechaActual, setFechaActual] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<unknown>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      let desde: Date, hasta: Date
      if (vista === 'dia') {
        desde = new Date(fechaActual); desde.setHours(0, 0, 0, 0)
        hasta = new Date(fechaActual); hasta.setHours(23, 59, 59, 999)
      } else if (vista === 'semana') {
        desde = startOfWeek(fechaActual, { weekStartsOn: 1 })
        hasta = endOfWeek(fechaActual, { weekStartsOn: 1 })
      } else {
        desde = startOfMonth(fechaActual)
        hasta = endOfMonth(fechaActual)
      }

      const params = new URLSearchParams({
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
      })
      const res = await fetch(`/api/dashboard/appointments?${params}`)
      const json = await res.json()
      if (json.success) setCitas(json.data)
    } finally {
      setLoading(false)
    }
  }, [vista, fechaActual])

  useEffect(() => { cargar() }, [cargar])

  return (
    <>
      <Header
        titulo="Agenda"
        subtitulo={format(fechaActual, "MMMM yyyy")}
        accion={{ label: 'Nueva cita', onClick: () => { setCitaSeleccionada(null); setModalOpen(true) } }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AgendaCalendario
          citas={citas}
          loading={loading}
          vista={vista}
          onVistaCambio={setVista}
          fechaActual={fechaActual}
          onFechaCambio={setFechaActual}
          onCitaClick={(cita) => { setCitaSeleccionada(cita); setModalOpen(true) }}
          onNuevaCita={(fecha) => { setCitaSeleccionada({ fechaInicio: fecha }); setModalOpen(true) }}
        />
      </div>

      {modalOpen && (
        <CitaModal
          cita={citaSeleccionada}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); cargar() }}
        />
      )}
    </>
  )
}
