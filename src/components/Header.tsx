import React from 'react';
import { Settings, Info, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { GameSettings } from '../types/shelem';
import { toPersianDigits } from '../utils/shelemEngine';

interface HeaderProps {
  settings: GameSettings;
  onOpenSettings: () => void;
  onOpenAboutUs: () => void;
  onNewGamePrompt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenAboutUs,
  onNewGamePrompt,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 transition-colors duration-200 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[var(--color-surface-hover)] to-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center text-xl sm:text-2xl font-black text-[var(--color-accent)] shadow-md select-none">
            ♠♥
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-main)] tracking-tight">
                شلم پرو
              </h1>
              <span className="text-xs sm:text-sm text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-lg border border-[var(--color-accent)]/20 font-tabular">
                سقف {toPersianDigits(settings.targetScore, settings.persianDigits)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* About Us button */}
          <button
            onClick={onOpenAboutUs}
            title="درباره ما و مشخصات سازنده نرم‌افزار"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-main)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all min-h-[38px] active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>درباره ما</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="حالت تمام‌صفحه"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="تنظیمات ظاهر و قوانین بازی"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* New Game button */}
          <button
            onClick={onNewGamePrompt}
            title="شروع بازی جدید"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all min-h-[38px] active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازی جدید</span>
          </button>
        </div>
      </div>
    </header>
  );
};
