import { useRef } from 'react'
import { X, Download, Upload, RotateCcw } from 'lucide-react'
import type { Ifc4dPlan } from '../../../ifc/types'
import { groupKeyToString } from '../../../ifc/groupKey'
import type { ManualOverride } from '../useIfcModel'
import { useLanguage, type Language } from '../../../i18n/LanguageContext'

interface Ifc4dMappingPanelProps {
  fileName: string
  plan: Ifc4dPlan
  overrides: Map<string, ManualOverride>
  onSetOverride: (key: string, value: ManualOverride | null) => void
  onResetAll: () => void
  onClose: () => void
}

interface ExportedMapping {
  fileName: string
  overrides: { key: string; startMonth: number; endMonth: number }[]
}

export function Ifc4dMappingPanel({ fileName, plan, overrides, onSetOverride, onResetAll, onClose }: Ifc4dMappingPanelProps) {
  const { language, tr } = useLanguage()
  const importRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const payload: ExportedMapping = {
      fileName,
      overrides: [...overrides.entries()].map(([key, v]) => ({ key, startMonth: v.startMonth, endMonth: v.endMonth })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `4d-mapping-${fileName.replace(/\.ifc$/i, '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    file
      .text()
      .then((text) => {
        const data = JSON.parse(text) as ExportedMapping
        if (!Array.isArray(data.overrides)) return
        for (const o of data.overrides) {
          if (typeof o.key !== 'string' || typeof o.startMonth !== 'number' || typeof o.endMonth !== 'number') continue
          onSetOverride(o.key, { startMonth: o.startMonth, endMonth: o.endMonth })
        }
      })
      .catch(() => {
        // Bỏ qua file JSON không hợp lệ - không có gì để áp dụng.
      })
  }

  return (
    <div className="overlay-navy fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="panel flex max-h-[80vh] w-full max-w-2xl flex-col p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <p className="label-caps text-brand">{tr('Quản lý BIM', 'BIM Manager')}</p>
            <h2 className="font-heading text-lg font-semibold text-on-surface">{tr('Tinh chỉnh thanh trượt 4D', 'Fine-tune the 4D slider')}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-on-surface-variant">
          {tr('Nguồn mốc tháng hiện tại', 'Current month source')}: <b className="text-on-surface">{planSourceLabel(plan.source, language)}</b>.{' '}
          {tr(
            'Sửa trực tiếp tháng bắt đầu/kết thúc cho từng nhóm (tầng × bộ môn) bên dưới - xem trước ngay trên thanh trượt. Chỉ lưu trong phiên làm việc, có thể xuất ra file JSON để dùng lại lần sau.',
            'Edit the start/end month for each group (storey × discipline) below directly - preview it right on the slider. Changes are session-only; export to a JSON file to reuse them later.',
          )}
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-outline-variant">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 border-b border-outline-variant bg-surface-container-lowest text-on-surface-variant">
              <tr>
                <th className="py-2 pr-2 font-medium">{tr('Nhóm (tầng × bộ môn × giai đoạn)', 'Group (storey × discipline × phase)')}</th>
                <th className="w-24 py-2 pr-2 font-medium">{tr('Bắt đầu (tháng)', 'Start (month)')}</th>
                <th className="w-24 py-2 pr-2 font-medium">{tr('Kết thúc (tháng)', 'End (month)')}</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {plan.schedules.map((s) => {
                const key = groupKeyToString(s.key)
                const hasOverride = overrides.has(key)
                return (
                  <tr key={key} className={`border-b border-outline-variant ${hasOverride ? 'bg-brand/5' : ''}`}>
                    <td className="py-1.5 pr-2 text-on-surface">{s.label}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step={0.1}
                        value={s.startMonth}
                        onChange={(e) =>
                          onSetOverride(key, { startMonth: Number(e.target.value), endMonth: s.endMonth })
                        }
                        className="w-20 border border-outline-variant bg-surface-container-lowest px-1.5 py-1 text-on-surface focus:border-navy focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step={0.1}
                        value={s.endMonth}
                        onChange={(e) =>
                          onSetOverride(key, { startMonth: s.startMonth, endMonth: Number(e.target.value) })
                        }
                        className="w-20 border border-outline-variant bg-surface-container-lowest px-1.5 py-1 text-on-surface focus:border-navy focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5">
                      {hasOverride && (
                        <button
                          type="button"
                          title={tr('Đặt lại nhóm này', 'Reset this group')}
                          onClick={() => onSetOverride(key, null)}
                          className="p-1 text-on-surface-variant hover:text-brand"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-outline-variant pt-4">
          <button type="button" onClick={onResetAll} className="btn-ghost text-xs">
            {tr('Đặt lại toàn bộ', 'Reset all')}
          </button>
          <div className="flex gap-2">
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
                e.target.value = ''
              }}
            />
            <button type="button" onClick={() => importRef.current?.click()} className="btn-secondary !px-3 !py-2 text-xs">
              <Upload size={13} /> {tr('Nhập JSON', 'Import JSON')}
            </button>
            <button type="button" onClick={handleExport} className="btn-primary !px-3 !py-2 text-xs">
              <Download size={13} /> {tr('Xuất JSON', 'Export JSON')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function planSourceLabel(source: Ifc4dPlan['source'], language: Language): string {
  if (language === 'en') {
    if (source === 'native') return 'native 4D data in the IFC file'
    if (source === 'manual') return 'manually fine-tuned'
    return 'from the real construction schedule (dates matched to corresponding work items)'
  }
  if (source === 'native') return 'dữ liệu 4D gốc trong file IFC'
  if (source === 'manual') return 'đã tinh chỉnh thủ công'
  return 'theo tiến độ thi công thật (khớp ngày theo hạng mục tương ứng)'
}
