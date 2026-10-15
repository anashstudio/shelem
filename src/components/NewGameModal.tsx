import React, { useState } from 'react';
import { X, Play, Users, Target, Shuffle } from 'lucide-react';
import { GameSettings, TeamId } from '../types/shelem';
import { toPersianDigits } from '../utils/shelemEngine';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  canCancel: boolean;
  settings: GameSettings;
  onStartGame: (teamAName: string, teamBName: string, targetScore: number, initialDealer: TeamId) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  canCancel,
  settings,
  onStartGame,
}) => {
  const [teamAName, setTeamAName] = useState('ما (تیم ۱)');
  const [teamBName, setTeamBName] = useState('شما (تیم ۲)');
  const [targetScore, setTargetScore] = useState(settings.targetScore || 2000);
  const [initialDealer, setInitialDealer] = useState<TeamId>('teamA');

  if (!isOpen) return null;

  const quickTargets = [1000, 1165, 1200, 1500, 2000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aName = teamAName.trim() || 'تیم ۱';
    const bName = teamBName.trim() || 'تیم ۲';
    onStartGame(aName, bName, targetScore, initialDealer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-[var(--color-text-main)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs">
              ♠♥
            </div>
            <h3 className="text-base sm:text-lg font-bold">شروع بازی جدید شلم</h3>
          </div>
          {canCancel && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Team Names */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>نام‌های دو گروه یا تیم‌های بازی:</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-[var(--color-badge-a)] block mb-1 font-medium">گروه اول:</span>
                <input
                  type="text"
                  required
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  placeholder="مثلاً: ما یا تیم آرش"
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] font-semibold outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>

              <div>
                <span className="text-[11px] text-[var(--color-badge-b)] block mb-1 font-medium">گروه دوم:</span>
                <input
                  type="text"
                  required
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  placeholder="مثلاً: شما یا تیم بابک"
                  className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] font-semibold outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Target Score */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>سقف امتیاز برد بازی:</span>
              </label>
              <span className="text-sm font-extrabold text-[var(--color-accent)] font-tabular">
                {toPersianDigits(targetScore, settings.persianDigits)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {quickTargets.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setTargetScore(q)}
                  className={`py-2 rounded-lg text-xs font-bold font-tabular border transition-all ${
                    targetScore === q
                      ? 'bg-[var(--color-accent)] text-neutral-950 border-[var(--color-accent)] shadow-sm'
                      : 'bg-[var(--color-canvas)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  {toPersianDigits(q, settings.persianDigits)}
                </button>
              ))}
            </div>
          </div>

          {/* Dealer Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>پاسور (دست‌دهنده) دست اول:</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInitialDealer('teamA')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  initialDealer === 'teamA'
                    ? 'border-[var(--color-badge-a)] bg-[var(--color-badge-a)]/15 text-[var(--color-badge-a)] font-bold'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)]'
                }`}
              >
                {teamAName || 'گروه اول'}
              </button>
              <button
                type="button"
                onClick={() => setInitialDealer('teamB')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  initialDealer === 'teamB'
                    ? 'border-[var(--color-badge-b)] bg-[var(--color-badge-b)]/15 text-[var(--color-badge-b)] font-bold'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)]'
                }`}
              >
                {teamBName || 'گروه دوم'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>شروع بازی و رفتن به تابلوی امتیازات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
