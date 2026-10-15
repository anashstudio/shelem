import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Share2, Check, ArrowRight } from 'lucide-react';
import { GameSettings, GameState, TeamId } from '../types/shelem';
import { toPersianDigits } from '../utils/shelemEngine';

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameState;
  settings: GameSettings;
  winnerTeam: TeamId;
  onNewGame: () => void;
  onContinuePlaying: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  isOpen,
  onClose,
  game,
  settings,
  winnerTeam,
  onNewGame,
  onContinuePlaying,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
          });
        }, 300);
        return () => clearTimeout(timer);
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lastRound = game.rounds[game.rounds.length - 1];
  const scoreA = lastRound ? lastRound.teamATotalAfter : 0;
  const scoreB = lastRound ? lastRound.teamBTotalAfter : 0;
  const winnerName = winnerTeam === 'teamA' ? game.teamAName : game.teamBName;
  const winnerScore = winnerTeam === 'teamA' ? scoreA : scoreB;
  const loserName = winnerTeam === 'teamA' ? game.teamBName : game.teamAName;
  const loserScore = winnerTeam === 'teamA' ? scoreB : scoreA;

  // Stats calculation
  const totalRounds = game.rounds.length;
  const totalShelems = game.rounds.filter((r) => r.isShelem || r.isReverseShelem).length;
  const maxBid = Math.max(...game.rounds.map((r) => r.bidAmount), 100);
  const failedRounds = game.rounds.filter(
    (r) =>
      (r.biddingTeam === 'teamA' && r.teamAScoreDelta < 0) ||
      (r.biddingTeam === 'teamB' && r.teamBScoreDelta < 0)
  ).length;

  const handleShareSummary = () => {
    const summary = `🏆 گزارش پایان بازی شلم:
تیم قهرمان: ${winnerName} با ${winnerScore} امتیاز
تیم دوم: ${loserName} با ${loserScore} امتیاز
سقف امتیاز بازی: ${settings.targetScore}
تعداد دست‌های بازی: ${totalRounds} دست
تعداد شلم‌ها: ${totalShelems}
ثبت شده با اپلیکیشن شلم پرو`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-250">
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-accent)] rounded-3xl w-full max-w-md shadow-2xl p-6 text-center text-[var(--color-text-main)] space-y-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--color-accent)]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-accent)]/20 border border-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/20 animate-bounce">
          <Trophy className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-[var(--color-accent)] font-bold">
            پایان بازی و اعلام قهرمان
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {winnerName} برنده شد!
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            با عبور از سقف {toPersianDigits(settings.targetScore, settings.persianDigits)} امتیاز، این بازی به پایان رسید.
          </p>
        </div>

        {/* Big Final Score Card */}
        <div className="p-4 rounded-2xl bg-[var(--color-canvas)]/70 border border-[var(--color-border)] grid grid-cols-2 gap-3 divide-x divide-x-reverse divide-[var(--color-border)]/60 font-tabular">
          <div className="text-center">
            <span className="text-xs text-[var(--color-badge-a)] font-bold block mb-1">
              {game.teamAName} {winnerTeam === 'teamA' && '👑'}
            </span>
            <span className="text-3xl font-extrabold text-[var(--color-text-main)]">
              {toPersianDigits(scoreA, settings.persianDigits)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-[var(--color-badge-b)] font-bold block mb-1">
              {game.teamBName} {winnerTeam === 'teamB' && '👑'}
            </span>
            <span className="text-3xl font-extrabold text-[var(--color-text-main)]">
              {toPersianDigits(scoreB, settings.persianDigits)}
            </span>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)] font-tabular text-right bg-[var(--color-canvas)]/30 p-3 rounded-xl border border-[var(--color-border)]/50">
          <div>
            <span>تعداد دست‌ها: </span>
            <strong className="text-white">{toPersianDigits(totalRounds, settings.persianDigits)}</strong>
          </div>
          <div>
            <span>تعداد شلم‌ها: </span>
            <strong className="text-amber-400">{toPersianDigits(totalShelems, settings.persianDigits)}</strong>
          </div>
          <div>
            <span>بالاترین تعهد: </span>
            <strong className="text-white">{toPersianDigits(maxBid, settings.persianDigits)}</strong>
          </div>
          <div>
            <span>دست‌های خالی کرده: </span>
            <strong className="text-rose-400">{toPersianDigits(failedRounds, settings.persianDigits)}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onNewGame}
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>شروع مسابقه و بازی جدید</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShareSummary}
              className="py-2.5 px-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--color-text-main)] flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">کپی شد</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>اشتراک‌گذاری خلاصه</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onContinuePlaying}
              className="py-2.5 px-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <span>ادامه بازی</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
