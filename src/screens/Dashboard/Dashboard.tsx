import {
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  FileBarChart,
} from 'lucide-react'
import { KpiCard } from '../../components/common/KpiCard'
import { ProjectGallery } from './ProjectGallery'
import { ProjectInfoPanel } from './ProjectInfoPanel'
import { SCurveChart } from './SCurveChart'
import { BlockProgressChart } from './BlockProgressChart'
import { ClashPieChart } from './ClashPieChart'
import { AlertsPanel } from './AlertsPanel'
import {
  getOpenClashCount,
  getPreventedCost,
  getFieldChangesRecent,
  getTotalQuantityVariance,
} from '../../utils/metrics'
import {
  OVERALL_ACTUAL_PROGRESS,
  OVERALL_PLANNED_PROGRESS,
  REMAINING_DAYS,
  TOTAL_PROJECT_DAYS,
} from '../../data/constants'
import { MODEL_MATCH_RATE_AVG } from '../../data/modelVersions'
import { formatVNDShort, formatNumber } from '../../utils/format'

export function Dashboard() {
  const openClashes = getOpenClashCount()
  const preventedCost = getPreventedCost()
  const fieldChangesRecent = getFieldChangesRecent(30)
  const quantityVariance = getTotalQuantityVariance()
  const behindPlan = OVERALL_ACTUAL_PROGRESS < OVERALL_PLANNED_PROGRESS

  return (
    <div className="grid grid-cols-2 grid-flow-row-dense gap-4 p-6 md:grid-cols-4 lg:grid-cols-6">
      <div className="col-span-2 md:col-span-4 lg:col-span-6">
        <ProjectGallery />
      </div>

      <div className="col-span-2 md:col-span-4 lg:col-span-6">
        <ProjectInfoPanel />
      </div>

      {/* Ô lớn (hero) - con số bán hàng quan trọng nhất */}
      <div className="panel panel-hover animate-countup col-span-2 row-span-2 flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-on-surface-variant">Chi phí rủi ro đã ngăn ngừa</p>
          <div className="flex h-10 w-10 items-center justify-center bg-status-success/15 text-status-success">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div>
          <p className="font-heading text-4xl font-bold text-status-success">{formatVNDShort(preventedCost)}</p>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            Tổng chi phí ước tính của các xung đột nhóm A, B đã phát hiện và xử lý qua mô hình BIM trước khi thi công.
          </p>
        </div>
      </div>

      <KpiCard
        label="Tiến độ tổng thể"
        value={`${OVERALL_ACTUAL_PROGRESS}%`}
        icon={<TrendingUp size={16} />}
        accent={behindPlan ? 'warning' : 'success'}
        sub={`Kế hoạch: ${OVERALL_PLANNED_PROGRESS}%`}
      />
      <KpiCard
        label="Số ngày còn lại"
        value={`${formatNumber(REMAINING_DAYS)} ngày`}
        icon={<CalendarDays size={16} />}
        accent="neutral"
        sub={`Tổng ${formatNumber(TOTAL_PROJECT_DAYS)} ngày thi công`}
      />
      <KpiCard
        label="Xung đột chưa xử lý"
        value={formatNumber(openClashes)}
        icon={<AlertTriangle size={16} />}
        accent="warning"
        sub="Mới + Đang xử lý"
      />
      <KpiCard
        label="Thay đổi hiện trường (30 ngày)"
        value={formatNumber(fieldChangesRecent)}
        icon={<RefreshCw size={16} />}
        accent="info"
        sub="Đã ghi nhận vào mô hình"
      />
      <KpiCard
        label="Mô hình khớp hiện trạng"
        value={`${MODEL_MATCH_RATE_AVG}%`}
        icon={<CheckCircle2 size={16} />}
        accent="success"
        sub="Trung bình 4 block"
      />
      <KpiCard
        label="Chênh lệch khối lượng phát hiện"
        value={formatVNDShort(quantityVariance)}
        icon={<FileBarChart size={16} />}
        accent="brand"
        sub="Đối chiếu hợp đồng vs mô hình (5D)"
      />

      <div className="panel col-span-2 p-4 md:col-span-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">Tiến độ kế hoạch và thực tế (S-curve)</p>
        <div className="h-64">
          <SCurveChart />
        </div>
      </div>

      <div className="col-span-2 row-span-2">
        <AlertsPanel />
      </div>

      <div className="panel col-span-2 p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">Tiến độ theo block</p>
        <div className="h-52">
          <BlockProgressChart />
        </div>
      </div>
      <div className="panel col-span-2 p-4">
        <p className="mb-3 text-sm font-semibold text-on-surface">Xung đột theo cặp bộ môn</p>
        <div className="h-52">
          <ClashPieChart />
        </div>
      </div>
    </div>
  )
}
