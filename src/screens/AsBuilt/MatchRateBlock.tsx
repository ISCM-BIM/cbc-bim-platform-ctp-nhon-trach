import { BLOCKS } from '../../data/constants'
import { MODEL_MATCH_RATE, MODEL_MATCH_RATE_AVG } from '../../data/modelVersions'
import { useLanguage } from '../../i18n/LanguageContext'

export function MatchRateBlock() {
  const { tr } = useLanguage()
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">{tr('Mức độ trùng khớp mô hình với hiện trạng', 'Model-to-as-built match rate')}</p>
        <span className="text-xs text-on-surface-variant">{tr('Trung bình', 'Average')} {MODEL_MATCH_RATE_AVG}%</span>
      </div>
      <div className="space-y-3">
        {BLOCKS.map((b) => {
          const rate = MODEL_MATCH_RATE[b.id]
          return (
            <div key={b.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Block {b.id}</span>
                <span className="font-medium tabular-nums text-on-surface">{rate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-status-success"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {MODEL_MATCH_RATE_AVG === 0 && (
        <p className="mt-3 text-[11px] text-on-surface-variant">
          {tr('Chưa có hiện trạng thi công thật để đối chiếu (dự án chưa ký hợp đồng).', 'No real as-built conditions to compare against yet (the project has not been contracted).')}
        </p>
      )}
    </div>
  )
}
