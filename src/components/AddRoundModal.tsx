import React, { useState, useEffect } from 'react';
import { X, Check, Award, AlertTriangle, Sparkles } from 'lucide-react';
import { GameSettings, GameState, Round, TeamId } from '../types/shelem';
import { calculateRoundDeltas, toPersianDigits, getDealerForRound } from '../utils/shelemEngine';

interface AddRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRound: (roundData: Omit<Round, 'id' | 'roundNumber' | 'teamATotalAfter' | 'teamBTotalAfter'>) => void;
  game: GameState;
  settings: GameSettings;
  editingRound?: Round | null;
}

export const AddRoundModal: React.FC<AddRoundModalProps> = ({
  isOpen,
  onClose,
  onSaveRound,
  game,
  settings,
  editingRound,
}) => {
  const [biddingTeam, setBiddingTeam] = useState<TeamId>('teamA');
  const [bidAmount, setBidAmount] = useState<number>(120);
  const [isBidShelem, setIsBidShelem] = useState<boolean>(false); // Team BID Shelem (500)
  const [biddingPoints, setBiddingPoints] = useState<number>(120); // Hakem team card points (0..185)
  const [isReverseShelem, setIsReverseShelem] = useState<boolean>(false);
  const [isDouble, setIsDouble] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'defender' | 'hakem'>('defender');

  // Common bid values (100 to 185)
  const quickBids = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185];

  // Scores from 5 to 180 in increments of 5 for step 3
  const step3Scores = [
    5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
    65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120,
    125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180
  ];

  // Initialize or reset when modal opens or editingRound changes
  useEffect(() => {
    if (editingRound) {
      setBiddingTeam(editingRound.biddingTeam);
      const isShelemBidded = Boolean(editingRound.isBidShelem || editingRound.bidAmount >= 500);
      setIsBidShelem(isShelemBidded);
      setBidAmount(isShelemBidded ? 500 : editingRound.bidAmount);
      const points =
        editingRound.biddingTeam === 'teamA'
          ? editingRound.teamAPointsEarned
          : editingRound.teamBPointsEarned;
      setBiddingPoints(points);
      setIsReverseShelem(editingRound.isReverseShelem);
      setIsDouble(editingRound.isDouble);
    } else {
      const currentRoundIdx = game.rounds.length;
      const dealer = getDealerForRound(game.initialDealer, currentRoundIdx);
      setBiddingTeam(dealer === 'teamA' ? 'teamB' : 'teamA');
      setBidAmount(120);
      setIsBidShelem(false);
      setBiddingPoints(120);
      setIsReverseShelem(false);
      setIsDouble(false);
      setInputMode('defender');
    }
  }, [editingRound, isOpen, game]);

  if (!isOpen) return null;

  const opponentTeam: TeamId = biddingTeam === 'teamA' ? 'teamB' : 'teamA';
  const hakemName = biddingTeam === 'teamA' ? game.teamAName : game.teamBName;
  const opponentName = opponentTeam === 'teamA' ? game.teamAName : game.teamBName;

  // Points breakdown: Total is strictly 185
  const hakemPoints = biddingPoints;
  const defenderPoints = Math.max(0, 185 - hakemPoints);

  const teamAPoints = biddingTeam === 'teamA' ? hakemPoints : defenderPoints;
  const teamBPoints = biddingTeam === 'teamB' ? hakemPoints : defenderPoints;

  const isShelemAchieved = hakemPoints === 185;

  // Calculate live preview deltas
  const preview = calculateRoundDeltas(
    biddingTeam,
    bidAmount,
    teamAPoints,
    isShelemAchieved,
    isReverseShelem,
    isDouble,
    settings,
    isBidShelem
  );

  const handleBiddingTeamChange = (team: TeamId) => {
    setBiddingTeam(team);
  };

  const handleBidSelect = (amount: number) => {
    setIsBidShelem(false);
    setBidAmount(amount);
  };

  const handleBidShelemToggle = () => {
    if (!isBidShelem) {
      setIsBidShelem(true);
      setBidAmount(500);
    } else {
      setIsBidShelem(false);
      setBidAmount(120);
    }
  };

  // Change via Hakem's score (0..185)
  const handleHakemPointsChange = (val: number) => {
    const clamped = Math.min(185, Math.max(0, val));
    setBiddingPoints(clamped);
    if (clamped === 0) {
      setIsReverseShelem(true);
    } else {
      setIsReverseShelem(false);
    }
  };

  // Change via Opponent/Defender's score (0..185)
  const handleDefenderPointsChange = (defenderVal: number) => {
    const clampedDef = Math.min(185, Math.max(0, defenderVal));
    const newHakem = 185 - clampedDef;
    handleHakemPointsChange(newHakem);
  };

  const handleSave = () => {
    const roundIdx = editingRound ? editingRound.roundNumber - 1 : game.rounds.length;
    const dealer = getDealerForRound(game.initialDealer, roundIdx);

    onSaveRound({
      biddingTeam,
      bidAmount: isBidShelem ? 500 : bidAmount,
      teamAPointsEarned: teamAPoints,
      teamBPointsEarned: teamBPoints,
      isShelem: isShelemAchieved,
      isBidShelem,
      isReverseShelem,
      isDouble,
      isUnderHalfBid: preview.isUnderHalfBid,
      teamAScoreDelta: preview.teamAScoreDelta,
      teamBScoreDelta: preview.teamBScoreDelta,
      dealer,
      timestamp: editingRound ? editingRound.timestamp : Date.now(),
    });
    onClose();
  };

  const isEditing = Boolean(editingRound);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl max-h-[94vh] flex flex-col overflow-hidden text-[var(--color-text-main)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              {isEditing
                ? `ویرایش دست شماره ${toPersianDigits(editingRound!.roundNumber, settings.persianDigits)}`
                : `ثبت دست شماره ${toPersianDigits(game.rounds.length + 1, settings.persianDigits)}`}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              مجموع کل امتیازهای هر دست ۱۸۵ است
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* Section 1: Hakem (Bidding Team) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">
                ۱. کدام تیم خواند و حاکم شد؟
              </label>
              <span className="text-[11px] text-[var(--color-accent)] font-medium">
                تیم مقابل پاس داده است
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleBiddingTeamChange('teamA')}
                className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  biddingTeam === 'teamA'
                    ? 'border-[var(--color-badge-a)] bg-[var(--color-badge-a)]/15 text-[var(--color-badge-a)] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)] hover:border-[var(--color-border)]/80'
                }`}
              >
                <div className="text-xs">{game.teamAName}</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">
                  {biddingTeam === 'teamA' ? '👑 حاکم این دست' : 'تیم مقابل (پاس)'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleBiddingTeamChange('teamB')}
                className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  biddingTeam === 'teamB'
                    ? 'border-[var(--color-badge-b)] bg-[var(--color-badge-b)]/15 text-[var(--color-badge-b)] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/40 text-[var(--color-text-muted)] hover:border-[var(--color-border)]/80'
                }`}
              >
                <div className="text-xs">{game.teamBName}</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">
                  {biddingTeam === 'teamB' ? '👑 حاکم این دست' : 'تیم مقابل (پاس)'}
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Bid Amount (100..185 or Shelem 500) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">
                ۲. میزان تعهد حاکم ({hakemName}):
              </label>
              <span className="text-base font-extrabold text-[var(--color-accent)] font-tabular">
                {isBidShelem ? 'تعهد شلم (۵۰۰ امتیاز)' : `${toPersianDigits(bidAmount, settings.persianDigits)} تعهد`}
              </span>
            </div>

            {/* Quick Bid Pills Grid */}
            <div className="grid grid-cols-6 gap-1.5">
              {quickBids.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleBidSelect(b)}
                  className={`py-2 text-xs font-bold font-tabular rounded-lg border transition-all cursor-pointer ${
                    bidAmount === b && !isBidShelem
                      ? 'bg-[var(--color-accent)] text-neutral-950 border-[var(--color-accent)] shadow-sm'
                      : 'bg-[var(--color-canvas)]/60 border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-accent)]/50'
                  }`}
                >
                  {toPersianDigits(b, settings.persianDigits)}
                </button>
              ))}
            </div>

            {/* Bid Stepper & Shelem Button */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleBidSelect(Math.max(100, (isBidShelem ? 185 : bidAmount) - 5))}
                disabled={bidAmount <= 100 && !isBidShelem}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                -۵ تعهد
              </button>
              <button
                type="button"
                onClick={() => handleBidSelect(Math.min(185, (isBidShelem ? 180 : bidAmount) + 5))}
                disabled={bidAmount >= 185 && !isBidShelem}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                +۵ تعهد
              </button>
              <button
                type="button"
                onClick={handleBidShelemToggle}
                className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isBidShelem
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md ring-1 ring-amber-300'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                ⭐ تعهد شلم (۵۰۰)
              </button>
            </div>
          </div>

          {/* Section 3: Strictly 5-by-5 Card Points */}
          <div className="space-y-3 bg-[var(--color-canvas)]/50 p-4 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-text-main)]">
                ۳. ثبت امتیازهای بازی شده (فقط مضارب ۵):
              </label>
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                مجموع: ۱۸۵ امتیاز
              </span>
            </div>

            {/* Clickable Team Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Opponent Team Card */}
              <button
                type="button"
                onClick={() => setInputMode('defender')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  inputMode === 'defender'
                    ? 'border-[var(--color-accent)] bg-[var(--color-surface)] ring-2 ring-[var(--color-accent)] shadow-md'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/60 hover:border-[var(--color-border)]/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-neutral-300">امتیاز تیم مقابل</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">({opponentName})</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-black font-tabular text-[var(--color-accent)]">
                    {toPersianDigits(defenderPoints, settings.persianDigits)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">امتیاز</span>
                </div>
                <div className="text-[10px] text-[var(--color-accent)] font-semibold mt-1">
                  {inputMode === 'defender' ? '👈 در حال انتخاب با دکمه‌ها' : 'برای انتخاب این تیم کلیک کنید'}
                </div>
              </button>

              {/* Hakem Team Card */}
              <button
                type="button"
                onClick={() => setInputMode('hakem')}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  inputMode === 'hakem'
                    ? 'border-[var(--color-accent)] bg-[var(--color-surface)] ring-2 ring-[var(--color-accent)] shadow-md'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)]/60 hover:border-[var(--color-border)]/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-neutral-300">امتیاز تیم حاکم</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">({hakemName})</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-3xl font-black font-tabular text-[var(--color-text-main)]">
                    {toPersianDigits(hakemPoints, settings.persianDigits)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">امتیاز</span>
                </div>
                <div className="text-[10px] text-[var(--color-accent)] font-semibold mt-1">
                  {inputMode === 'hakem' ? '👈 در حال انتخاب با دکمه‌ها' : 'برای انتخاب این تیم کلیک کنید'}
                </div>
              </button>
            </div>

            {/* 5 to 180 Buttons Grid */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">
                  امتیاز {inputMode === 'defender' ? `تیم مقابل (${opponentName})` : `تیم حاکم (${hakemName})`} را انتخاب کنید:
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)] font-tabular">
                  (از ۵ تا ۱۸۰، گام‌های ۵ تایی)
                </span>
              </div>

              {/* Grid of 5-by-5 buttons */}
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-[var(--color-canvas)]/70 rounded-xl border border-[var(--color-border)]/60">
                {step3Scores.map((score) => {
                  const isCurrentActive =
                    inputMode === 'defender'
                      ? defenderPoints === score
                      : hakemPoints === score;

                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => {
                        if (inputMode === 'defender') {
                          handleDefenderPointsChange(score);
                        } else {
                          handleHakemPointsChange(score);
                        }
                      }}
                      className={`py-2 px-1 text-xs font-bold font-tabular rounded-lg border transition-all text-center cursor-pointer ${
                        isCurrentActive
                          ? 'bg-[var(--color-accent)] text-neutral-950 border-[var(--color-accent)] shadow-md font-black scale-105 z-10'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-accent)]/60'
                      }`}
                    >
                      {toPersianDigits(score, settings.persianDigits)}
                    </button>
                  );
                })}
              </div>

              {/* 0 and 185 buttons & Step +-5 buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (inputMode === 'defender') {
                      handleDefenderPointsChange(0);
                    } else {
                      handleHakemPointsChange(0);
                    }
                  }}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold font-tabular transition-all cursor-pointer ${
                    (inputMode === 'defender' ? defenderPoints === 0 : hakemPoints === 0)
                      ? 'bg-rose-500 text-white border-rose-400 font-black'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  ۰ (پوچ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (inputMode === 'defender') {
                      handleDefenderPointsChange(Math.max(0, defenderPoints - 5));
                    } else {
                      handleHakemPointsChange(Math.max(0, hakemPoints - 5));
                    }
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold cursor-pointer"
                >
                  -۵ امتیاز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (inputMode === 'defender') {
                      handleDefenderPointsChange(Math.min(185, defenderPoints + 5));
                    } else {
                      handleHakemPointsChange(Math.min(185, hakemPoints + 5));
                    }
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold cursor-pointer"
                >
                  +۵ امتیاز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (inputMode === 'defender') {
                      handleDefenderPointsChange(185);
                    } else {
                      handleHakemPointsChange(185);
                    }
                  }}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold font-tabular transition-all cursor-pointer ${
                    (inputMode === 'defender' ? defenderPoints === 185 : hakemPoints === 185)
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-black'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-amber-300'
                  }`}
                >
                  ۱۸۵ (کامل)
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Double Option */}
          {settings.allowDouble && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-canvas)]/30 border border-[var(--color-border)]">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-main)]">دست دوبل (ضریب ۲)</span>
                <p className="text-[11px] text-[var(--color-text-muted)]">امتیازات یا جریمه این دست دوبرابر محاسبه شود</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDouble(!isDouble)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isDouble ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    isDouble ? 'left-1' : 'right-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Section 5: Exact Live Mathematical Outcome Preview */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              preview.isSuccess
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm">
              {preview.isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isBidShelem
                      ? 'شلم موفق! حاکم هر ۱۸۵ امتیاز را برنده شد'
                      : `تعهد حاکم انجام شد (${toPersianDigits(hakemPoints, settings.persianDigits)} امتیاز از ${toPersianDigits(bidAmount, settings.persianDigits)} تعهد)`}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {isBidShelem
                      ? `شلم منفی شد! تیم مقابل ${toPersianDigits(defenderPoints, settings.persianDigits)} امتیاز گرفت`
                      : preview.isUnderHalfBid
                      ? `شلم منفی! حاکم کمتر از نصف تعهدش را گرفت (${toPersianDigits(hakemPoints, settings.persianDigits)} از ${toPersianDigits(bidAmount, settings.persianDigits)} تعهد)`
                      : `حاکم خالی کرد! (${toPersianDigits(hakemPoints, settings.persianDigits)} امتیاز کمتر از ${toPersianDigits(bidAmount, settings.persianDigits)} تعهد)`}
                  </span>
                </>
              )}
            </div>

            {/* Explanation Prose */}
            <div className="text-xs text-neutral-300 pb-2 leading-relaxed border-b border-white/10">
              {isBidShelem ? (
                preview.isSuccess ? (
                  <span>
                    تیم حاکم ({hakemName}) شلم خوانده بود و تمام ۱۸۵ امتیاز را گرفت؛ پس <strong className="text-emerald-400 font-bold">+{toPersianDigits(settings.shelemBonus, settings.persianDigits)} امتیاز</strong> شلم مثبت می‌گیرد و تیم مقابل ۰ امتیاز می‌گیرد.
                  </span>
                ) : (
                  <span>
                    تیم حاکم ({hakemName}) شلم خوانده بود اما موفق به کسب تمام دست‌ها نشد؛ در نتیجه تیم حاکم <strong className="text-rose-400 font-extrabold">{toPersianDigits(settings.shelemBonus, settings.persianDigits)}- امتیاز (شلم منفی)</strong> می‌گیرد و تیم مقابل ({opponentName}) فقط امتیاز کسب‌شده خود یعنی <strong className="text-emerald-400 font-bold">+{toPersianDigits(defenderPoints, settings.persianDigits)} امتیاز</strong> را دریافت می‌کند.
                  </span>
                )
              ) : preview.isSuccess ? (
                <span>
                  تیم حاکم ({hakemName}) به تعهد خود رسید؛ پس تمام <strong className="text-emerald-400 font-bold">{toPersianDigits(hakemPoints, settings.persianDigits)}</strong> امتیاز خود را می‌گیرد و تیم مقابل ({opponentName}) نیز <strong className="text-emerald-400 font-bold">{toPersianDigits(defenderPoints, settings.persianDigits)}</strong> امتیاز کسب‌شده‌اش را می‌گیرد.
                </span>
              ) : preview.isUnderHalfBid ? (
                <span>
                  قانون نصف تعهد: تیم حاکم ({hakemName}) باید حداقل نصف تعهدش یعنی <strong className="text-white font-bold">{toPersianDigits(Math.ceil(bidAmount / 2), settings.persianDigits)} امتیاز</strong> را می‌گرفت، اما تنها <strong className="text-rose-300 font-bold">{toPersianDigits(hakemPoints, settings.persianDigits)} امتیاز</strong> گرفت؛ بنابراین تیم حاکم <strong className="text-rose-400 font-extrabold">{toPersianDigits(settings.shelemBonus, settings.persianDigits)}- امتیاز (شلم منفی)</strong> می‌خورد و تیم مقابل ({opponentName}) امتیاز کسب‌شده خود (<strong className="text-emerald-400 font-extrabold">+{toPersianDigits(defenderPoints, settings.persianDigits)}</strong>) را دریافت می‌کند.
                </span>
              ) : (
                <span>
                  تیم حاکم ({hakemName}) حداقل نصف تعهد را گرفت اما به سقف تعهد خود نرسید (خالی کرد)؛ پس به میزان تعهدش <strong className="text-rose-400 font-bold">{toPersianDigits(bidAmount, settings.persianDigits)}-</strong> منفی می‌گیرد و تیم مقابل ({opponentName}) امتیاز کسب‌شده‌اش (<strong className="text-emerald-400 font-bold">+{toPersianDigits(defenderPoints, settings.persianDigits)}</strong>) را می‌گیرد.
                </span>
              )}
            </div>

            {/* Exact Points Delta Result */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 font-tabular">
              <div className="p-2 rounded-lg bg-black/20">
                <span className="text-neutral-400 block mb-0.5">{game.teamAName}:</span>
                <strong
                  className={`text-base ${
                    preview.teamAScoreDelta < 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'
                  }`}
                >
                  {preview.teamAScoreDelta > 0 ? '+' : ''}
                  {toPersianDigits(preview.teamAScoreDelta, settings.persianDigits)} امتیاز
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <span className="text-neutral-400 block mb-0.5">{game.teamBName}:</span>
                <strong
                  className={`text-base ${
                    preview.teamBScoreDelta < 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'
                  }`}
                >
                  {preview.teamBScoreDelta > 0 ? '+' : ''}
                  {toPersianDigits(preview.teamBScoreDelta, settings.persianDigits)} امتیاز
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/60 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isEditing ? 'ذخیره تغییرات' : 'ثبت دست'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
