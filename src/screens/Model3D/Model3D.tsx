import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import type { Discipline } from '../../types'
import { DISCIPLINES, PROJECT_START } from '../../data/constants'
import { MEP_SYSTEM_CATEGORIES, type MepSystemCategory } from '../../ifc/mepSystem'
import { modelClashes } from '../../data/modelClashes'
import { useRole } from '../../context/RoleContext'
import { addDays, addMonths, daysBetween } from '../../utils/random'
import { formatDate, formatMonthShort } from '../../utils/format'
import { Scene } from './scene/Scene'
import { IfcFilterPanel } from './ifc/IfcFilterPanel'
import { IfcUploadCard } from './ifc/IfcUploadCard'
import { IfcElementPanel } from './ifc/IfcElementPanel'
import { Ifc4dMappingPanel } from './ifc/Ifc4dMappingPanel'
import { ModelClashPanel } from './ifc/ModelClashPanel'
import { pickColumnPositions } from './ifc/clashMarkers'
import type { ClashMarkerData } from './ifc/IfcClashMarkers'
import { MonthSlider } from './MonthSlider'
import { useIfcModel } from './useIfcModel'
import { describeCurrentActivity, DAYS_PER_MONTH } from '../../ifc/ifc4d'
import { realDayRangeForWbs } from '../../ifc/realScheduleMapping'

// Số ngày thi công thật CỦA RIÊNG RBF6 (mã "4.3" trong schedule.ts) - model IFC hiện tại chỉ
// dựng 1 nhà (RBF6), không phải cả Giai đoạn 2 (349 ngày, gồm cả RBF7) - xem ghi chú đầu
// ifc/realScheduleMapping.ts.
const RBF6_DAY_RANGE = realDayRangeForWbs('4.3')
const RBF6_CONSTRUCTION_DAYS = RBF6_DAY_RANGE.endDay - RBF6_DAY_RANGE.startDay

// "Tháng" trên thanh trượt 4D quy đổi ngược ra ngày thật (tháng 1 = PROJECT_START) - dùng để hiện
// ngày thật thay vì số tháng trừu tượng, khớp đúng cách hiển thị của tab Tiến độ thi công.
function dateOfMonth(month: number): Date {
  return addDays(PROJECT_START, Math.round((month - 1) * DAYS_PER_MONTH))
}
function monthOfDate(date: Date): number {
  return 1 + daysBetween(PROJECT_START, date) / DAYS_PER_MONTH
}
// Mốc tick trên thanh trượt bám ĐÚNG ranh giới tháng dương lịch thật (giống buildMonthColumns
// trong GanttChart.tsx của tab Tiến độ thi công) - nếu chỉ tăng đều theo chỉ số tháng trừu tượng
// (quy đổi ~30.44 ngày/tháng), 2 mốc liền kề có thể rơi cùng 1 tháng dương lịch thật (gây nhãn
// trùng, vd "T1/27" 2 lần liên tiếp) vì tháng thật dài ngắn khác 30.44 ngày.
function buildRealMonthMarks(maxMonth: number): number[] {
  const marks: number[] = []
  let cursor = new Date(PROJECT_START)
  while (true) {
    const m = monthOfDate(cursor)
    marks.push(m)
    if (m >= maxMonth) break
    cursor = addMonths(cursor, 1)
  }
  return marks
}

const ALL_VISIBLE: Record<Discipline, boolean> = DISCIPLINES.reduce(
  (acc, d) => ({ ...acc, [d]: true }),
  {} as Record<Discipline, boolean>,
)

const ALL_MEP_VISIBLE: Record<MepSystemCategory, boolean> = MEP_SYSTEM_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c]: true }),
  {} as Record<MepSystemCategory, boolean>,
)

// Tốc độ chạy tự động thanh trượt 4D khi bấm nút Play - đủ nhanh để xem hết trong 1 lần demo,
// đủ chậm để còn phân biệt được từng giai đoạn xuất hiện. Đây là mốc "1x" - người dùng chọn
// thêm 0.5x/2x/4x qua nút chọn tốc độ cạnh nút Play (xem SPEED_OPTIONS).
const BASE_MONTHS_PER_SECOND = 0.6
const SPEED_OPTIONS = [0.5, 1, 2, 4]

// Nền tảng này gắn cứng vào đúng 1 dự án thật (file IFC do CBC cung cấp - "NT-CTP_NT3-CD-A-
// R6_7-R24_detached.ifc", 70MB, mô hình Kiến trúc RBF6 - CHỈ 1 trong 2 nhà xưởng của gói thầu,
// xuất Revit → ODA, xem ghi chú đầu ifc/realScheduleMapping.ts).
// File hiện lưu CỤC BỘ ở public/project-data/project-model.ifc (gitignored, không track git) -
// CHƯA chuyển sang Vercel Blob như dự án trước (dist/ hiện ~70MB, vẫn dưới giới hạn 100MB của
// Vercel Hobby nên chưa bắt buộc phải tách ngay - xem README mục 5/8). Khi thật sự deploy và cần
// tách ra Blob, dùng đúng pattern đã áp dụng cho dự án trước:
//   npx vercel blob put "public/project-data/project-model.ifc" --access public \
//     --pathname project-model.ifc --allow-overwrite --cache-control-max-age 3600
// rồi đổi PROJECT_IFC_URL bên dưới sang URL Blob + thêm `?v=N` cache-busting khi cập nhật file
// sau này (xem lý do đầy đủ trong lịch sử dự án trước - trình duyệt có thể cache lâu hơn header
// Cache-Control thật, đổi query string buộc tải lại hoàn toàn).
const PROJECT_IFC_URL = './project-data/project-model.ifc'
const PROJECT_IFC_NAME = 'Mô hình RBF6 ctpark Nhơn Trạch.ifc'

export interface Model3DFocus {
  discipline: Discipline
}

interface Model3DProps {
  focus?: Model3DFocus | null
}

export function Model3D({ focus }: Model3DProps) {
  const { role } = useRole()
  const ifc = useIfcModel()

  const [month, setMonth] = useState(1)
  const [visible, setVisible] = useState<Record<Discipline, boolean>>(ALL_VISIBLE)
  const [visibleStoreys, setVisibleStoreys] = useState<'all' | Set<number | null>>('all')
  const [visibleMepSystems, setVisibleMepSystems] = useState<Record<MepSystemCategory, boolean>>(ALL_MEP_VISIBLE)
  const [cutEnabled, setCutEnabled] = useState(false)
  const [cutPosition, setCutPosition] = useState(0)
  const [selectedExpressID, setSelectedExpressID] = useState<number | null>(null)
  const [showMapping, setShowMapping] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedModelClashId, setSelectedModelClashId] = useState<string | null>(null)

  useEffect(() => {
    ifc.loadFromUrl(PROJECT_IFC_URL, PROJECT_IFC_NAME)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset bộ lọc/thanh trượt về mặc định mỗi khi model tải xong (kể cả khi bấm "Thử lại").
  // Phụ thuộc vào THAM CHIẾU ifc.plan (không phải ifc.status) - đã đo thực tế thấy setStatus
  // ('ready') và setBasePlan(plan) đôi khi KHÔNG cùng lọt vào 1 lần render (dù cùng gọi liền
  // nhau, không có await ở giữa) khiến effect phụ thuộc ifc.status "lỡ" đúng lượt render duy
  // nhất mà cả 2 điều kiện (status==='ready' && plan) cùng đúng, rồi không bao giờ chạy lại vì
  // status không đổi thêm lần nào nữa - triệu chứng: model load xong, hiển thị đúng
  // "ready" (dùng ifc.model/ifc.bounds khác), nhưng thanh trượt 4D đứng yên ở tháng 1 mặc định
  // thay vì nhảy tới minMonth thật. Theo dõi ifc.plan trực tiếp tránh phụ thuộc vào việc 2 state
  // riêng biệt có batch chung 1 lần render hay không.
  useEffect(() => {
    if (ifc.status !== 'ready' || !ifc.plan) return
    setMonth(ifc.plan.minMonth)
    setVisible(ALL_VISIBLE)
    setVisibleStoreys('all')
    setVisibleMepSystems(ALL_MEP_VISIBLE)
    setCutEnabled(false)
    setCutPosition(0)
    setSelectedExpressID(null)
    setSelectedModelClashId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ifc.plan])

  // Deep-link từ màn Khối lượng & Chi phí ("Xem trên mô hình 3D") - lọc theo đúng bộ môn của
  // hạng mục đang xem, đẩy thanh trượt tới cuối để thấy toàn bộ cấu kiện bộ môn đó.
  useEffect(() => {
    if (!focus) return
    setVisible(DISCIPLINES.reduce((acc, d) => ({ ...acc, [d]: d === focus.discipline }), {} as Record<Discipline, boolean>))
    if (ifc.plan) setMonth(ifc.plan.maxMonth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])

  const planMinMonth = ifc.plan?.minMonth
  const planMaxMonth = ifc.plan?.maxMonth

  const monthMarks = useMemo(() => (planMaxMonth != null ? buildRealMonthMarks(planMaxMonth) : []), [planMaxMonth])

  // Đếm số cấu kiện theo hệ MEP thật có trong model đang mở - quyết định phần lọc "Hệ thống
  // MEP" hiện những mục nào (chỉ hiện hệ thật sự tồn tại, xem IfcFilterPanel), chỉ tính lại khi
  // đổi model.
  const mepSystemCounts = useMemo<Partial<Record<MepSystemCategory, number>>>(() => {
    if (!ifc.model) return {}
    const counts: Partial<Record<MepSystemCategory, number>> = {}
    for (const el of ifc.model.elements.values()) {
      if (el.discipline !== 'MEP' || !el.mepSystem) continue
      counts[el.mepSystem] = (counts[el.mepSystem] ?? 0) + 1
    }
    return counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ifc.model])

  // Điểm đánh dấu va chạm thật ("TH- VA CHAM.xlsx" CBC cung cấp) - vị trí lấy theo cấu kiện
  // cột thật của mô hình (xem clashMarkers.ts), chỉ tính lại khi đổi model, không phải mỗi lần
  // render.
  const clashMarkerData = useMemo<ClashMarkerData[]>(() => {
    if (!ifc.model) return []
    const positions = pickColumnPositions(ifc.model, modelClashes.length)
    return modelClashes.map((clash, i) => ({ clash, position: positions[i] })).filter((m): m is ClashMarkerData => !!m.position)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ifc.model])

  // "Đang thi công: <tầng> · <hạng mục>" tại đúng thời điểm month - giúp người xem (đặc biệt
  // không rành kỹ thuật) dễ hình dung đang xem tới phần nào khi kéo/chạy thanh trượt, không chỉ
  // thấy số tháng trừu tượng. Tính lại theo đúng nhịp đổi month (kể cả lúc Play chạy liên tục),
  // nhưng bản thân giá trị trả về chỉ đổi đúng lúc có nhóm mới thật sự bắt đầu - không đổi mỗi
  // khung hình.
  const currentActivity = useMemo(() => {
    if (!ifc.plan || !ifc.model) return null
    return describeCurrentActivity(ifc.plan, month, ifc.model.storeys)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ifc.plan, ifc.model, month])

  // Chọn cấu kiện thường và chọn điểm va chạm dùng chung 1 khung panel bên phải - bấm cái này
  // phải bỏ chọn cái kia để không hiện chồng 2 panel cùng lúc.
  const handleSelectElement = (expressID: number | null) => {
    setSelectedModelClashId(null)
    setSelectedExpressID(expressID)
  }
  const handleSelectModelClash = (id: string) => {
    setSelectedExpressID(null)
    setSelectedModelClashId(id)
  }

  // Chạy tự động thanh trượt 4D khi bấm Play - dùng requestAnimationFrame (không phải
  // setInterval) để tăng mượt theo delta-time thực giữa các khung hình thay vì nhảy cứng theo
  // từng bước cố định. Tự dừng (setIsPlaying(false)) khi chạm mốc cuối - giữ nguyên trạng thái
  // công trình hoàn thiện trên màn hình thay vì lặp lại đột ngột từ đầu.
  useEffect(() => {
    if (!isPlaying || planMaxMonth == null) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // Chặn trần dt - khi tab bị trình duyệt tạm ngưng rAF (chuyển tab, thu nhỏ cửa sổ, máy
      // sleep...) rồi quay lại, khoảng cách giữa 2 khung hình có thể lên tới vài giây; không
      // chặn sẽ khiến mô hình "nhảy cóc" một đoạn dài thay vì tiếp tục chạy mượt từ chỗ đang
      // dừng - coi như thời gian tab không hiển thị không tính vào tiến độ.
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      setMonth((m) => {
        const next = m + dt * BASE_MONTHS_PER_SECOND * playbackSpeed
        if (next >= planMaxMonth) {
          setIsPlaying(false)
          return planMaxMonth
        }
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // playbackSpeed trong deps: đổi tốc độ ngay cả khi đang Play phải khởi động lại effect để
    // vòng lặp đọc giá trị mới (không phải closure cũ) - chỉ reset mốc thời gian nội bộ (last),
    // không giật hình vì month vẫn tiếp tục từ đúng vị trí đang có.
  }, [isPlaying, planMaxMonth, playbackSpeed])

  // Kéo tay thanh trượt trong lúc đang Play phải dừng Play ngay - nếu không, khung hình animation
  // tiếp theo sẽ ghi đè lại vị trí người dùng vừa kéo (input onChange chỉ bắn khi người dùng thao
  // tác trực tiếp trên thanh trượt, không phải từ setMonth của vòng lặp play, nên phân biệt được).
  const handleManualMonthChange = (m: number) => {
    setIsPlaying(false)
    setMonth(m)
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    // Đang ở cuối thanh trượt (đã xem hết/chưa từng chạy) - bấm Play thì quay lại từ đầu thay
    // vì đứng yên (RAF chỉ tăng dần, không tự lùi được nếu đã ở max).
    if (planMinMonth != null && planMaxMonth != null && month >= planMaxMonth) {
      setMonth(planMinMonth)
    }
    setIsPlaying(true)
  }

  const toggleDiscipline = (d: Discipline) => setVisible((prev) => ({ ...prev, [d]: !prev[d] }))
  const toggleMepSystem = (c: MepSystemCategory) => setVisibleMepSystems((prev) => ({ ...prev, [c]: !prev[c] }))
  const isBimManager = role === 'bim_manager'
  const ready = ifc.status === 'ready' && ifc.model && ifc.plan && ifc.bounds

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {ready && isBimManager && (
        <div className="flex shrink-0 items-center gap-2">
          <p className="truncate text-xs text-on-surface-variant">
            Mô hình dự án thật · <span className="font-medium text-on-surface">{ifc.model!.fileName}</span>
          </p>
          <button type="button" onClick={() => setShowMapping(true)} className="btn-secondary ml-auto !px-3 !py-1.5 text-xs">
            <SlidersHorizontal size={13} /> Tinh chỉnh 4D
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-4">
        {ready && (
          <IfcFilterPanel
            fileName={ifc.model!.fileName}
            elementCount={ifc.model!.elementCount}
            triangleCount={ifc.model!.triangleCount}
            storeys={ifc.model!.storeys}
            visibleStoreys={visibleStoreys}
            onSelectStoreys={setVisibleStoreys}
            visible={visible}
            onToggle={toggleDiscipline}
            mepSystemCounts={mepSystemCounts}
            visibleMepSystems={visibleMepSystems}
            onToggleMepSystem={toggleMepSystem}
            cutEnabled={cutEnabled}
            onToggleCut={() => setCutEnabled((v) => !v)}
            cutPosition={cutPosition}
            onCutPositionChange={setCutPosition}
            cutRange={ifc.bounds!.radius * 1.2}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {ready ? (
              <Scene
                mode={{
                  kind: 'ifc',
                  model: ifc.model!,
                  plan: ifc.plan!,
                  bounds: ifc.bounds!,
                  month,
                  visibleDisciplines: visible,
                  visibleStoreys,
                  visibleMepSystems,
                  selectedExpressID,
                  onSelectElement: handleSelectElement,
                  clashMarkers: clashMarkerData,
                  selectedModelClashId,
                  onSelectModelClash: handleSelectModelClash,
                }}
                cutEnabled={cutEnabled}
                cutPosition={cutPosition}
              />
            ) : (
              <div className="panel h-full">
                <IfcUploadCard
                  status={ifc.status}
                  progress={ifc.progress}
                  error={ifc.error}
                  sizeWarning={ifc.sizeWarning}
                  onRetry={() => ifc.loadFromUrl(PROJECT_IFC_URL, PROJECT_IFC_NAME)}
                />
              </div>
            )}

            {ready && ifc.api && selectedExpressID != null && (
              <IfcElementPanel
                api={ifc.api}
                modelID={ifc.model!.modelID}
                expressID={selectedExpressID}
                onClose={() => setSelectedExpressID(null)}
              />
            )}

            {ready &&
              selectedModelClashId &&
              (() => {
                const i = modelClashes.findIndex((c) => c.id === selectedModelClashId)
                if (i === -1) return null
                return (
                  <ModelClashPanel
                    clash={modelClashes[i]}
                    index={i}
                    total={modelClashes.length}
                    onClose={() => setSelectedModelClashId(null)}
                  />
                )
              })()}
          </div>

          {ready && (
            <MonthSlider
              month={month}
              onChange={handleManualMonthChange}
              min={ifc.plan!.minMonth}
              max={ifc.plan!.maxMonth}
              title={`Tiến độ thi công RBF6 · ${RBF6_CONSTRUCTION_DAYS} ngày (${planSourceShortLabel(ifc.plan!.source)})`}
              formatLabel={(m) => formatDate(dateOfMonth(m))}
              formatMark={(m) => formatMonthShort(dateOfMonth(m))}
              marks={monthMarks}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              activityLabel={currentActivity ? `${currentActivity.storeyName} · ${currentActivity.activityLabel}` : null}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              speedOptions={SPEED_OPTIONS}
            />
          )}
        </div>
      </div>

      {showMapping && ready && (
        <Ifc4dMappingPanel
          fileName={ifc.model!.fileName}
          plan={ifc.plan!}
          overrides={ifc.overrides}
          onSetOverride={ifc.setOverride}
          onResetAll={ifc.resetOverrides}
          onClose={() => setShowMapping(false)}
        />
      )}
    </div>
  )
}

function planSourceShortLabel(source: 'native' | 'schedule' | 'manual'): string {
  if (source === 'native') return 'dữ liệu 4D gốc'
  if (source === 'manual') return 'đã tinh chỉnh'
  return 'theo tiến độ thi công thật'
}
