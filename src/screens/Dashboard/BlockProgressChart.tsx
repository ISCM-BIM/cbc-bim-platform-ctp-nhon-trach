import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getBlockProgressData } from '../../utils/metrics'
import { STATUS_COLORS } from '../../data/constants'
import { ChartTooltip } from '../../components/common/ChartTooltip'
import { useLanguage } from '../../i18n/LanguageContext'

export function BlockProgressChart() {
  const { language, tr } = useLanguage()
  const data = getBlockProgressData(language)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="block"
          tick={{ fill: '#42474f', fontSize: 11 }}
          axisLine={{ stroke: '#dbdad9' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fill: '#42474f', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip formatter={(item) => `${item.value}%`} />}
          cursor={{ fill: '#06477c', fillOpacity: 0.05 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#42474f' }}
          formatter={(value: string) => <span className="text-on-surface-variant">{value}</span>}
        />
        <Bar dataKey="hoan_thanh" stackId="a" name={tr('Đã hoàn thành', 'Completed')} fill={STATUS_COLORS.info} radius={[0, 0, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="con_lai" stackId="a" name={tr('Còn lại', 'Remaining')} fill="#dbdad9" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
