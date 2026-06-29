// src/components/superadmin/SuperAdminStatsChart.tsx
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { mes: string; empresas: number }[]
}

export function SuperAdminStatsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEmpresas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f67ff" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#4f67ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)', textTransform: 'capitalize' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
          formatter={(v: number) => [v, 'Empresas nuevas']}
        />
        <Area type="monotone" dataKey="empresas" stroke="#4f67ff" strokeWidth={2} fill="url(#gradEmpresas)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
