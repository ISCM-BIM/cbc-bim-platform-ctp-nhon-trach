import { useCallback, useMemo, useRef, useState } from 'react'
import type { IfcAPI } from 'web-ifc'
import { getIfcApi } from '../../ifc/ifcApi'
import { parseIfcFile, computeModelBounds, closeIfcModel, InvalidIfcFileError } from '../../ifc/parseIfc'
import { detectNativeSchedule, buildSchedulePlan, applyManualOverrides, DAYS_PER_MONTH } from '../../ifc/ifc4d'
import { realDayRangeForWbs } from '../../ifc/realScheduleMapping'
import type { ParsedIfcModel, Ifc4dPlan, IfcParseProgress } from '../../ifc/types'
import { useLanguage } from '../../i18n/LanguageContext'

// Khung thanh trượt 4D khớp đúng khoảng ngày thi công thật của RBF6 (mã "4.3" trong
// data/schedule.ts - model IFC hiện tại chỉ dựng riêng RBF6, xem ghi chú đầu
// ifc/realScheduleMapping.ts) - KHÔNG dùng khung "cả Giai đoạn 2" (349 ngày, gồm cả RBF7) vì sẽ
// tạo khoảng "chết" ở 2 đầu thanh trượt. DAYS_PER_MONTH lấy từ ifc4d.ts (1 nguồn duy nhất, tránh
// định nghĩa 30.44 lặp lại ở 2 nơi rồi lệch nhau).
const RBF6_RANGE = realDayRangeForWbs('4.3')
const SCHEDULE_MIN_MONTH = 1 + RBF6_RANGE.startDay / DAYS_PER_MONTH
const SCHEDULE_MAX_MONTH = 1 + RBF6_RANGE.endDay / DAYS_PER_MONTH

export type IfcLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

const MAX_RECOMMENDED_BYTES = 150 * 1024 * 1024 // 150MB - cảnh báo, không chặn cứng

export interface ManualOverride {
  startMonth: number
  endMonth: number
}

export function useIfcModel() {
  const { tr } = useLanguage()
  const [status, setStatus] = useState<IfcLoadStatus>('idle')
  const [progress, setProgress] = useState<IfcParseProgress | null>(null)
  const [model, setModel] = useState<ParsedIfcModel | null>(null)
  const [basePlan, setBasePlan] = useState<Ifc4dPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Map<string, ManualOverride>>(new Map())
  const [api, setApi] = useState<IfcAPI | null>(null)
  const activeModelID = useRef<number | null>(null)

  const load = useCallback(async (file: File) => {
    setStatus('loading')
    setError(null)
    setSizeWarning(null)
    setProgress(null)
    setOverrides(new Map())

    if (!file.name.toLowerCase().endsWith('.ifc')) {
      setStatus('error')
      setError(
        tr(
          `"${file.name}" không phải file .ifc. Hãy chọn file IFC xuất từ Revit (File → Export → IFC).`,
          `"${file.name}" is not an .ifc file. Please choose an IFC file exported from Revit (File → Export → IFC).`,
        ),
      )
      return
    }
    if (file.size > MAX_RECOMMENDED_BYTES) {
      setSizeWarning(
        tr(
          `File khá lớn (${(file.size / 1024 / 1024).toFixed(0)}MB) - quá trình đọc có thể mất vài phút và làm chậm trình duyệt vì chạy hoàn toàn phía client.`,
          `This file is quite large (${(file.size / 1024 / 1024).toFixed(0)}MB) - parsing may take a few minutes and slow down the browser since it all runs client-side.`,
        ),
      )
    }

    try {
      const ifcApi = await getIfcApi()
      if (activeModelID.current != null) closeIfcModel(ifcApi, activeModelID.current)
      const parsed = await parseIfcFile(ifcApi, file, setProgress)
      if (parsed.groups.length === 0) {
        throw new InvalidIfcFileError(
          tr(
            'Không tìm thấy hình học nào trong file - kiểm tra lại file IFC có được xuất kèm hình học (không chỉ dữ liệu thuộc tính).',
            'No geometry found in this file - check that the IFC file was exported with geometry included (not just property data).',
          ),
        )
      }
      const native = await detectNativeSchedule(ifcApi, parsed.modelID, parsed.groups)
      const plan = native ?? buildSchedulePlan(parsed.groups, parsed.storeys, SCHEDULE_MIN_MONTH, SCHEDULE_MAX_MONTH)
      activeModelID.current = parsed.modelID
      setApi(ifcApi)
      setModel(parsed)
      setBasePlan(plan)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : tr('Không đọc được file IFC - file có thể bị hỏng hoặc không đúng chuẩn.', 'Could not read the IFC file - it may be corrupted or non-standard.'),
      )
    }
  }, [tr])

  /** Tải file IFC đã đóng gói sẵn trong app (public/) thay vì chờ người dùng chọn file - dùng
   * cho trường hợp nền tảng gắn cứng vào 1 dự án thật duy nhất. */
  const loadFromUrl = useCallback(
    async (url: string, fileName: string) => {
      setStatus('loading')
      setError(null)
      setSizeWarning(null)
      setProgress({ stage: 'fetching' })
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(tr(`Không tải được file mô hình (HTTP ${res.status}).`, `Could not download the model file (HTTP ${res.status}).`))
        const blob = await res.blob()
        const file = new File([blob], fileName)
        await load(file)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : tr('Không tải được file mô hình.', 'Could not download the model file.'))
      }
    },
    [load, tr],
  )

  const clear = useCallback(() => {
    if (api && activeModelID.current != null) closeIfcModel(api, activeModelID.current)
    activeModelID.current = null
    setStatus('idle')
    setModel(null)
    setBasePlan(null)
    setError(null)
    setSizeWarning(null)
    setProgress(null)
    setOverrides(new Map())
  }, [api])

  const setOverride = useCallback((key: string, value: ManualOverride | null) => {
    setOverrides((prev) => {
      const next = new Map(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }, [])

  const resetOverrides = useCallback(() => setOverrides(new Map()), [])

  const plan = useMemo(() => {
    if (!basePlan) return null
    return overrides.size > 0 ? applyManualOverrides(basePlan, overrides) : basePlan
  }, [basePlan, overrides])

  const bounds = useMemo(() => (model ? computeModelBounds(model.groups) : null), [model])

  return { status, progress, model, plan, bounds, error, sizeWarning, api, load, loadFromUrl, clear, overrides, setOverride, resetOverrides }
}
