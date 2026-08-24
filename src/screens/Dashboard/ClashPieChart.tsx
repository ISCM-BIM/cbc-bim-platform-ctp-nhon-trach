import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { getClashByDisciplinePair, disciplinePairColor } from '../../utils/metrics'
import { ChartTooltip } from '../../components/common/ChartTooltip'

export function ClashPieChart() {
  const data = getClashByDisciplinePair()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="38%"
          cy="50%"
          innerRadius="52%"
          outerRadius="85%"
          paddingAngle={2}
          isAnimationActive={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={disciplinePairColor(entry.name)} stroke="#ffffff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={(item) => `${item.value} xung đột`} />} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11.5, color: '#42474f', lineHeight: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
