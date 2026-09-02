import type { AppView } from '../../types'
import { IntroHero } from './IntroHero'
import { IntroWhatIsBIM } from './IntroWhatIsBIM'
import { IntroLifecycle } from './IntroLifecycle'
import { useLanguage } from '../../i18n/LanguageContext'
import cbcLogo from '../../assets/logos/cbc_logo_white.png'
import ctdLogo from '../../assets/logos/ctdlogo_white.png'
import iscmLogo from '../../assets/logos/iscm_white_text_v1.png'

interface IntroProps {
  onNavigate: (view: AppView) => void
}

export function Intro({ onNavigate }: IntroProps) {
  const { language, setLanguage, tr } = useLanguage()
  return (
    <div className="h-full w-full overflow-y-auto bg-surface">
      {/* Nút chuyển ngôn ngữ - LUÔN cố định góc phải trên cùng kể cả ở trang giới thiệu (chưa vào
          AppShell/TopBar), theo yêu cầu người dùng (2026-09-02) "ở trang chủ cũng nên có nút
          chuyển đổi ngôn ngữ luôn" - `fixed` (không phải `absolute`) để giữ nguyên vị trí khi
          cuộn qua Hero/BIM là gì/Vòng đời, không chỉ hiện ở đúng đoạn Hero. */}
      <div
        className="pop-shadow fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full border border-white/10 bg-navy-deep/90 p-1 backdrop-blur-sm"
        title={tr('Chuyển sang tiếng Anh', 'Switch to Vietnamese')}
      >
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            language === 'vi' ? 'pop-shadow bg-brand text-white' : 'text-white/60 hover:text-white/90'
          }`}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            language === 'en' ? 'pop-shadow bg-brand text-white' : 'text-white/60 hover:text-white/90'
          }`}
        >
          EN
        </button>
      </div>

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
