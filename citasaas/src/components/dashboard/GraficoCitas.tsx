// src/components/dashboard/GraficoCitas.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { dia: string; total: number }[]
}

export function GraficoCitas({ data }: Props) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Citas esta semana
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Últimos 7 días
          </p>
        </div>
        <span
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {data.reduce((s, d) => s + d.total, 0)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-muted)', textTransform: 'capitalize' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)',
              fontSize: '12px',
            }}
            cursor={{ fill: 'var(--bg-subtle)', radius: 8 }}
            formatter={(value: number) => [value, 'Citas']}
          />
          <Bar
            dataKey="total"
            fill="#4f67ff"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
