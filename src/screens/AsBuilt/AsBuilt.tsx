import { FieldChangeTimeline } from './FieldChangeTimeline'
import { ModelVersionTable } from './ModelVersionTable'
import { MatchRateBlock } from './MatchRateBlock'
import { BeforeAfterCompare } from './BeforeAfterCompare'

export function AsBuilt() {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <FieldChangeTimeline />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-1">
        <MatchRateBlock />
        <BeforeAfterCompare />
      </div>
      <div className="lg:col-span-3">
        <ModelVersionTable />
      </div>
    </div>
  )
}
