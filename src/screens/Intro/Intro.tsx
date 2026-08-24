import type { AppView } from '../../types'
import { IntroHero } from './IntroHero'
import { IntroWhatIsBIM } from './IntroWhatIsBIM'
import { IntroLifecycle } from './IntroLifecycle'
import cbcLogo from '../../assets/logos/cbc_logo_white.png'
import ctdLogo from '../../assets/logos/ctdlogo_white.png'
import iscmLogo from '../../assets/logos/iscm_white_text_v1.png'

interface IntroProps {
  onNavigate: (view: AppView) => void
}

export function Intro({ onNavigate }: IntroProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-surface">
      <IntroHero onEnter={() => onNavigate('dashboard')} />
      <IntroWhatIsBIM />
      <IntroLifecycle onNavigate={onNavigate} />

      {/* Footer đóng khung bằng Deep Navy, đối xứng với Hero mở đầu. */}
      <footer className="panel-navy border-t-0 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={cbcLogo} alt="CBC" className="h-6 w-auto object-contain opacity-90" />
            <span className="h-5 w-px bg-white/20" />
            <img src={ctdLogo} alt="College of Technology and Design" className="h-6 w-auto object-contain opacity-70" />
            <span className="h-5 w-px bg-white/20" />
            <img src={iscmLogo} alt="ISCM" className="h-6 w-auto object-contain opacity-70" />
          </div>
          <p className="text-[11px] text-white/35">© ISCM–UEH × CBC</p>
        </div>
      </footer>
    </div>
  )
}
