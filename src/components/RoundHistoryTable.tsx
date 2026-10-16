import React from 'react';
import { Edit2, Trash2, Award, AlertCircle, Sparkles } from 'lucide-react';
import { GameSettings, GameState, Round } from '../types/shelem';
import { toPersianDigits } from '../utils/shelemEngine';

interface RoundHistoryTableProps {
  game: GameState;
  settings: GameSettings;
  onEditRound: (round: Round) => void;
  onDeleteRound: (roundId: string) => void;
}

export const RoundHistoryTable: React.FC<RoundHistoryTableProps> = ({
  game,
  settings,
  onEditRound,
  onDeleteRound,
}) => {
  if (game.rounds.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 text-center space-y-2 text-[var(--color-text-muted)]">
        <p className="text-sm font-medium">هنوز هیچ دستی در این بازی ثبت نشده است.</p>
        <p className="text-xs">
          برگ‌ها را پخش کرده، خوانی کنید و با زدن دکمه «ثبت امتیاز دست جدید» اولین دست را وارد کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-[var(--color-text-main)]">
          جدول تاریخچه دست‌ها ({toPersianDigits(game.rounds.length, settings.persianDigits)} دست بازی شده)
        </h3>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          قابلیت ویرایش و بازنگری تمام دست‌ها
        </span>
      </div>

      <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]/60 text-[var(--color-text-muted)] font-semibold">
                <th className="py-3 px-3 w-12 text-center">دست</th>
                <th className="py-3 px-3">حاکم و تعهد</th>
                <th className="py-3 px-3 text-center">امتیاز بازی</th>
                <th className="py-3 px-3 text-center">
                  امتیاز {game.teamAName}
                </th>
                <th className="py-3 px-3 text-center">
                  امتیاز {game.teamBName}
                </th>
                <th className="py-3 px-3 text-center">
                  مجموع {game.teamAName}
                </th>
                <th className="py-3 px-3 text-center">
                  مجموع {game.teamBName}
                </th>
                <th className="py-3 px-3 w-16 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/40 font-tabular">
              {game.rounds.map((round) => {
                const bidderName =
                  round.biddingTeam === 'teamA' ? game.teamAName : game.teamBName;
                const isFail =
                  (round.biddingTeam === 'teamA' && round.teamAScoreDelta < 0) ||
                  (round.biddingTeam === 'teamB' && round.teamBScoreDelta < 0);

                return (
                  <tr
                    key={round.id}
                    className="hover:bg-[var(--color-surface-hover)]/40 transition-colors"
                  >
                    {/* Round number */}
                    <td className="py-3 px-3 text-center font-bold text-[var(--color-text-muted)]">
                      {toPersianDigits(round.roundNumber, settings.persianDigits)}
                    </td>

                    {/* Bidder & Bid */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[var(--color-text-main)]">
                          {bidderName}
                        </span>
                        <span className="text-[var(--color-accent)] font-bold">
                          {round.isBidShelem || round.bidAmount >= 500
                            ? '⭐ تعهد شلم'
                            : toPersianDigits(round.bidAmount, settings.persianDigits)}
                        </span>
                        {round.isDouble && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-sans">
                            2X
                          </span>
                        )}
                        {round.isReverseShelem && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-bold">
                            نوس
                          </span>
                        )}
                        {isFail && !round.isReverseShelem && (
                          <span className="text-[10px] text-rose-400 font-medium">
                            {round.isBidShelem || round.bidAmount >= 500
                              ? '(شلم منفی)'
                              : round.isUnderHalfBid
                              ? '(شلم منفی - زیر نصف)'
                              : '(خالی کرد)'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cards won */}
                    <td className="py-3 px-3 text-center text-[var(--color-text-muted)]">
                      <span>{toPersianDigits(round.teamAPointsEarned, settings.persianDigits)}</span>
                      <span className="mx-1 text-[var(--color-border)]">/</span>
                      <span>{toPersianDigits(round.teamBPointsEarned, settings.persianDigits)}</span>
                    </td>

                    {/* Delta Team A */}
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={
                          round.teamAScoreDelta < 0
                            ? 'text-rose-400 font-extrabold'
                            : round.teamAScoreDelta > 0
                            ? 'text-emerald-400'
                            : 'text-[var(--color-text-muted)]'
                        }
                      >
                        {round.teamAScoreDelta > 0 ? '+' : ''}
                        {toPersianDigits(round.teamAScoreDelta, settings.persianDigits)}
                      </span>
                    </td>

                    {/* Delta Team B */}
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={
                          round.teamBScoreDelta < 0
                            ? 'text-rose-400 font-extrabold'
                            : round.teamBScoreDelta > 0
                            ? 'text-emerald-400'
                            : 'text-[var(--color-text-muted)]'
                        }
                      >
                        {round.teamBScoreDelta > 0 ? '+' : ''}
                        {toPersianDigits(round.teamBScoreDelta, settings.persianDigits)}
                      </span>
                    </td>

                    {/* Total Team A */}
                    <td className="py-3 px-3 text-center font-extrabold text-[var(--color-text-main)] bg-[var(--color-canvas)]/30">
                      <span className={round.teamATotalAfter < 0 ? 'text-rose-400' : ''}>
                        {toPersianDigits(round.teamATotalAfter, settings.persianDigits)}
                      </span>
                    </td>

                    {/* Total Team B */}
                    <td className="py-3 px-3 text-center font-extrabold text-[var(--color-text-main)] bg-[var(--color-canvas)]/30">
                      <span className={round.teamBTotalAfter < 0 ? 'text-rose-400' : ''}>
                        {toPersianDigits(round.teamBTotalAfter, settings.persianDigits)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditRound(round)}
                          title="ویرایش این دست"
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRound(round.id)}
                          title="حذف این دست"
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
