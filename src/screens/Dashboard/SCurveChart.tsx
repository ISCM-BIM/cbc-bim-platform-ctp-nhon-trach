import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { getSCurveWeeklyData } from '../../utils/metrics'
import { STATUS_COLORS } from '../../data/constants'
import { ChartTooltip } from '../../components/common/ChartTooltip'

export function SCurveChart() {
  const raw = getSCurveWeeklyData()
  const data = raw.map((p) => ({
    ...p,
    gap: p.thuc_te !== null ? Math.max(0, p.ke_hoach - p.thuc_te) : 0,
  }))
  const lastActual = [...data].reverse().find((p) => p.thuc_te !== null)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#42474f', fontSize: 11 }}
          axisLine={{ stroke: '#dbdad9' }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fill: '#42474f', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#42474f' }}
          formatter={(value: string) => <span className="text-on-surface-variant">{value}</span>}
        />
        {lastActual && (
          <ReferenceLine
            x={lastActual.label}
            stroke="#42474f"
            strokeDasharray="2 2"
            label={{ value: 'Hôm nay', position: 'insideTopRight', fill: '#42474f', fontSize: 11 }}
          />
        )}
        <Area
          dataKey="thuc_te"
          stackId="a"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
          legendType="none"
          name=""
        />
        <Area
          dataKey="gap"
          stackId="a"
          stroke="none"
          fill={STATUS_COLORS.warning}
          fillOpacity={0.15}
          isAnimationActive={false}
          legendType="none"
          name=""
        />
        <Line
          dataKey="ke_hoach"
          name="Kế hoạch"
          stroke={STATUS_COLORS.neutral}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="thuc_te"
          name="Thực tế"
          stroke={STATUS_COLORS.info}
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
