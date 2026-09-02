import type { ReactNode } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import type { Discipline } from '../../types'
import { getClashWeeklyTrend, getClashCountBySeverity, getClashByDiscipline } from '../../utils/metrics'
import { STATUS_COLORS, CHART_PALETTE } from '../../data/constants'
import { ChartTooltip } from '../../components/common/ChartTooltip'
import { useLanguage } from '../../i18n/LanguageContext'
import { disciplineLabel } from '../../i18n/enumLabels'

function MiniPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel p-3">
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">{title}</p>
      <div className="h-40">{children}</div>
    </div>
  )
}

export function ClashCharts() {
  const { language, tr } = useLanguage()
  const trend = getClashWeeklyTrend(10)
  const severity = getClashCountBySeverity()
  const severityData = [
    { name: tr('Nhóm A', 'Group A'), value: severity.A, color: STATUS_COLORS.danger },
    { name: tr('Nhóm B', 'Group B'), value: severity.B, color: STATUS_COLORS.warning },
    { name: tr('Nhóm C', 'Group C'), value: severity.C, color: STATUS_COLORS.neutral },
  ]
  const byDiscipline = getClashByDiscipline()
  const disciplineData = Object.entries(byDiscipline).map(([name, value], i) => ({
    name: disciplineLabel(name as Discipline, language),
    value,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }))

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <MiniPanel title={tr('Xu hướng phát hiện / xử lý theo tuần', 'Weekly detection / resolution trend')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#42474f', fontSize: 10 }} axisLine={{ stroke: '#dbdad9' }} tickLine={false} interval={1} />
            <YAxis tick={{ fill: '#42474f', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#42474f' }} />
            <Line type="monotone" dataKey="phat_hien" name={tr('Phát hiện', 'Detected')} stroke={STATUS_COLORS.warning} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="xu_ly" name={tr('Đã xử lý', 'Resolved')} stroke={STATUS_COLORS.success} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </MiniPanel>

      <MiniPanel title={tr('Phân bố theo mức độ', 'Distribution by severity')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={severityData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#42474f', fontSize: 10 }} axisLine={{ stroke: '#dbdad9' }} tickLine={false} />
            <YAxis tick={{ fill: '#42474f', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#06477c', fillOpacity: 0.05 }} />
            <Bar dataKey="value" name={tr('Số lượng', 'Count')} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {severityData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </MiniPanel>

      <MiniPanel title={tr('Phân bố theo bộ môn liên quan', 'Distribution by discipline involved')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={disciplineData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#42474f', fontSize: 9.5 }} axisLine={{ stroke: '#dbdad9' }} tickLine={false} />
            <YAxis tick={{ fill: '#42474f', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#06477c', fillOpacity: 0.05 }} />
            <Bar dataKey="value" name={tr('Số lượng', 'Count')} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {disciplineData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </MiniPanel>
    </div>
  )
}
