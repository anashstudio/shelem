import React from 'react';
import { Plus, Undo2, Award, Sparkles, Edit2 } from 'lucide-react';
import { GameSettings, GameState, TeamId } from '../types/shelem';
import { toPersianDigits, getDealerForRound } from '../utils/shelemEngine';

interface ScoreBoardProps {
  game: GameState;
  settings: GameSettings;
  onOpenAddRound: () => void;
  onUndoLastRound: () => void;
  onEditTeamName: (team: TeamId) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  game,
  settings,
  onOpenAddRound,
  onUndoLastRound,
  onEditTeamName,
}) => {
  const lastRound = game.rounds[game.rounds.length - 1];
  const scoreA = lastRound ? lastRound.teamATotalAfter : 0;
  const scoreB = lastRound ? lastRound.teamBTotalAfter : 0;
  const target = settings.targetScore;

  const percentA = Math.min(100, Math.max(0, (scoreA / target) * 100));
  const percentB = Math.min(100, Math.max(0, (scoreB / target) * 100));

  const leadDifference = Math.abs(scoreA - scoreB);
  const leadingTeam: TeamId | 'tie' =
    scoreA > scoreB ? 'teamA' : scoreB > scoreA ? 'teamB' : 'tie';

  const upcomingDealer = getDealerForRound(game.initialDealer, game.rounds.length);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Dual Team Score Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden transition-colors">
        {/* Subtle Background Accent Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-[var(--color-badge-a)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Lead Status Bar */}
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-3 pb-2.5 border-b border-[var(--color-border)]/60">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">دست شماره:</span>
            <span className="font-bold text-[var(--color-text-main)] font-tabular">
              {toPersianDigits(game.rounds.length + 1, settings.persianDigits)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            {leadingTeam === 'tie' ? (
              <span>بازی برابر است</span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--color-accent)]">
                <Award className="w-3.5 h-3.5 inline" />
                <span>
                  {leadingTeam === 'teamA' ? game.teamAName : game.teamBName} با{' '}
                  <strong className="font-tabular">
                    {toPersianDigits(leadDifference, settings.persianDigits)}
                  </strong>{' '}
                  امتیاز پیشتاز
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span>پاسور این دست:</span>
            <span className="font-bold text-[var(--color-text-main)]">
              {upcomingDealer === 'teamA' ? game.teamAName : game.teamBName}
            </span>
          </div>
        </div>

        {/* Scores Columns */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
          {/* Vertical Divider */}
          <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px bg-[var(--color-border)]/60 pointer-events-none" />

          {/* Team A */}
          <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl transition-all">
            <div className="flex items-center gap-1.5 mb-1 group cursor-pointer" onClick={() => onEditTeamName('teamA')}>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] truncate max-w-[130px] sm:max-w-[200px]">
                {game.teamAName}
              </h2>
              <Edit2 className="w-3 h-3 text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100 transition-opacity" />
              {upcomingDealer === 'teamA' && (
                <span className="text-[10px] bg-[var(--color-canvas)] text-[var(--color-accent)] border border-[var(--color-border)] px-1.5 py-0.5 rounded font-medium">
                  پاسور
                </span>
              )}
            </div>

            {/* Big Score */}
            <div className="my-1 sm:my-2">
              <span
                className={`text-4xl sm:text-6xl font-extrabold font-tabular tracking-tight ${
                  scoreA < 0 ? 'text-rose-400' : 'text-[var(--color-text-main)]'
                }`}
              >
                {toPersianDigits(scoreA, settings.persianDigits)}
              </span>
            </div>

            {/* Score Progress */}
            <div className="w-full max-w-[220px] mt-2 space-y-1">
              <div className="h-2 w-full bg-[var(--color-canvas)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
                <div
                  className="h-full bg-[var(--color-badge-a)] transition-all duration-500 rounded-full"
                  style={{ width: `${percentA}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-tabular">
                <span>{toPersianDigits(Math.round(percentA), settings.persianDigits)}٪</span>
                <span>سقف {toPersianDigits(target, settings.persianDigits)}</span>
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl transition-all">
            <div className="flex items-center gap-1.5 mb-1 group cursor-pointer" onClick={() => onEditTeamName('teamB')}>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] truncate max-w-[130px] sm:max-w-[200px]">
                {game.teamBName}
              </h2>
              <Edit2 className="w-3 h-3 text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100 transition-opacity" />
              {upcomingDealer === 'teamB' && (
                <span className="text-[10px] bg-[var(--color-canvas)] text-[var(--color-accent)] border border-[var(--color-border)] px-1.5 py-0.5 rounded font-medium">
                  پاسور
                </span>
              )}
            </div>

            {/* Big Score */}
            <div className="my-1 sm:my-2">
              <span
                className={`text-4xl sm:text-6xl font-extrabold font-tabular tracking-tight ${
                  scoreB < 0 ? 'text-rose-400' : 'text-[var(--color-text-main)]'
                }`}
              >
                {toPersianDigits(scoreB, settings.persianDigits)}
              </span>
            </div>

            {/* Score Progress */}
            <div className="w-full max-w-[220px] mt-2 space-y-1">
              <div className="h-2 w-full bg-[var(--color-canvas)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
                <div
                  className="h-full bg-[var(--color-badge-b)] transition-all duration-500 rounded-full"
                  style={{ width: `${percentB}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-tabular">
                <span>{toPersianDigits(Math.round(percentB), settings.persianDigits)}٪</span>
                <span>سقف {toPersianDigits(target, settings.persianDigits)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center gap-3">
        {/* Primary CTA: Add Round */}
        <button
          onClick={onOpenAddRound}
          className="flex-1 h-14 sm:h-16 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md shadow-[var(--color-accent)]/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span>ثبت امتیاز دست جدید</span>
        </button>

        {/* Undo Button */}
        {game.rounds.length > 0 && (
          <button
            onClick={onUndoLastRound}
            title="بازگشت و حذف آخرین دست ثبت‌شده"
            className="h-14 sm:h-16 px-4 sm:px-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-400 hover:border-rose-400/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Undo2 className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold">لغو آخرین دست</span>
          </button>
        )}
      </div>
    </div>
  );
};
