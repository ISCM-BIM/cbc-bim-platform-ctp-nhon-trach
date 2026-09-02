import type { ReactNode } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
} from 'recharts'
import { getQuantityByGroup, getCostCurveData, getTopCostVarianceItems } from '../../utils/metrics'
import { STATUS_COLORS } from '../../data/constants'
import { ChartTooltip } from '../../components/common/ChartTooltip'
import { formatVNDShort } from '../../utils/format'
import { useLanguage } from '../../i18n/LanguageContext'

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel p-4">
      <p className="mb-3 text-xs font-semibold text-on-surface-variant">{title}</p>
      <div className="h-56">{children}</div>
    </div>
  )
}

export function QuantityCharts() {
  const { language, tr } = useLanguage()
  const byGroup = getQuantityByGroup(language)
  const costCurve = getCostCurveData()
  const topVariance = getTopCostVarianceItems(10).map((i) => ({
    name: i.id,
    fullName: i.name,
    value: i.costImpact,
  }))

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel title={tr('Khối lượng hợp đồng vs mô hình theo nhóm công tác', 'Contract vs. model quantity by work group')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byGroup} margin={{ top: 4, right: 8, left: 0, bottom: 28 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="group"
              tick={{ fill: '#42474f', fontSize: 9 }}
              axisLine={{ stroke: '#dbdad9' }}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tickFormatter={(v: number) => formatVNDShort(v, language)}
              tick={{ fill: '#42474f', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<ChartTooltip formatter={(item) => formatVNDShort(Number(item.value), language)} />} cursor={{ fill: '#06477c', fillOpacity: 0.05 }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#42474f' }} />
            <Bar dataKey="hop_dong" name={tr('Hợp đồng', 'Contract')} fill="#c2c7d1" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="mo_hinh" name={tr('Mô hình', 'Model')} fill={STATUS_COLORS.info} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title={tr('Đường cong chi phí luỹ kế - dự toán vs thực tế', 'Cumulative cost curve - budgeted vs. actual')}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={costCurve} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#42474f', fontSize: 9 }} axisLine={{ stroke: '#dbdad9' }} tickLine={false} interval={5} />
            <YAxis
              tickFormatter={(v: number) => formatVNDShort(v, language)}
              tick={{ fill: '#42474f', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={54}
            />
            <Tooltip content={<ChartTooltip formatter={(item) => formatVNDShort(Number(item.value), language)} />} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#42474f' }} />
            <Line type="monotone" dataKey="ke_hoach" name={tr('Dự toán', 'Budgeted')} stroke="#727780" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="thuc_te" name={tr('Thực tế', 'Actual')} stroke={STATUS_COLORS.info} strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title={tr('Top 10 hạng mục chênh lệch chi phí lớn nhất', 'Top 10 items by cost variance')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topVariance} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#dbdad9" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => formatVNDShort(v, language)} tick={{ fill: '#42474f', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#42474f', fontSize: 10 }} axisLine={false} tickLine={false} width={54} />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(item) => formatVNDShort(Number(item.value), language)}
                />
              }
              cursor={{ fill: '#06477c', fillOpacity: 0.05 }}
            />
            <Bar dataKey="value" name={tr('Ảnh hưởng chi phí', 'Cost impact')} radius={[0, 3, 3, 0]} isAnimationActive={false}>
              {topVariance.map((d, i) => (
                <Cell key={i} fill={d.value >= 0 ? STATUS_COLORS.warning : STATUS_COLORS.info} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  )
}
