import { GameSettings, GameState, Round, TeamId } from '../types/shelem';

export const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 2000,
  shelemBonus: 500,
  reverseShelemBonus: 500,
  penaltyType: 'bidAmount',
  allowDouble: false,
  requireHalfBidForHakem: true,
  opponentScoreOnFail: 'earnedPoints',
  theme: 'emerald',
  fontFamily: 'vazir',
  fontSize: 'normal',
  persianDigits: true,
};

export const SETTINGS_STORAGE_KEY = 'shelem_pro_settings_v1';
export const GAME_STORAGE_KEY = 'shelem_pro_game_v1';

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading game', e);
  }
  return null;
}

export function saveGame(game: GameState | null): void {
  try {
    if (game) {
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game));
    } else {
      localStorage.removeItem(GAME_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving game', e);
  }
}

export function toPersianDigits(n: number | string, enabled: boolean = true): string {
  if (!enabled) return String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

/**
 * Calculates score delta for a single round given the round parameters and settings
 */
export function calculateRoundDeltas(
  biddingTeam: TeamId,
  bidAmount: number,
  teamAPoints: number,
  isShelem: boolean,
  isReverseShelem: boolean,
  isDouble: boolean,
  settings: GameSettings,
  isBidShelem?: boolean
): {
  teamAScoreDelta: number;
  teamBScoreDelta: number;
  isSuccess: boolean;
  isUnderHalfBid: boolean;
} {
  const teamBPoints = Math.max(0, 185 - teamAPoints);
  const multiplier = isDouble ? 2 : 1;
  const shelemValue = settings.shelemBonus * multiplier;
  const isShelemBid = Boolean(isBidShelem || bidAmount >= 500);

  const hakemPoints = biddingTeam === 'teamA' ? teamAPoints : teamBPoints;
  const opponentPoints = biddingTeam === 'teamA' ? teamBPoints : teamAPoints;

  // Case 1: Reverse Shelem (Opponent took all 185)
  if (isReverseShelem || opponentPoints === 185) {
    const penalty = isShelemBid ? shelemValue : bidAmount * multiplier;
    if (biddingTeam === 'teamA') {
      return {
        teamAScoreDelta: -penalty,
        teamBScoreDelta: shelemValue,
        isSuccess: false,
        isUnderHalfBid: true,
      };
    } else {
      return {
        teamAScoreDelta: shelemValue,
        teamBScoreDelta: -penalty,
        isSuccess: false,
        isUnderHalfBid: true,
      };
    }
  }

  // Case 2: Team BIDS Shelem (تیمی که شلم می‌خواند)
  if (isShelemBid) {
    // If Hakem won all 185 cards (opponent = 0): Made Shelem! (+500)
    if (hakemPoints === 185 || isShelem) {
      return biddingTeam === 'teamA'
        ? { teamAScoreDelta: shelemValue, teamBScoreDelta: 0, isSuccess: true, isUnderHalfBid: false }
        : { teamAScoreDelta: 0, teamBScoreDelta: shelemValue, isSuccess: true, isUnderHalfBid: false };
    } else {
      // Hakem did NOT take all 185: Negative Shelem! (-500) and Opponent gets +500
      return biddingTeam === 'teamA'
        ? { teamAScoreDelta: -shelemValue, teamBScoreDelta: shelemValue, isSuccess: false, isUnderHalfBid: true }
        : { teamAScoreDelta: shelemValue, teamBScoreDelta: -shelemValue, isSuccess: false, isUnderHalfBid: true };
    }
  }

  // Case 3: Team did not bid Shelem, but won all 185 cards during the hand (unannounced Shelem)
  if (isShelem || hakemPoints === 185) {
    return biddingTeam === 'teamA'
      ? { teamAScoreDelta: shelemValue, teamBScoreDelta: 0, isSuccess: true, isUnderHalfBid: false }
      : { teamAScoreDelta: 0, teamBScoreDelta: shelemValue, isSuccess: true, isUnderHalfBid: false };
  }

  // Case 4: Normal trick play
  const isSuccess = hakemPoints >= bidAmount;

  if (isSuccess) {
    // Hakem made their bid
    const hakemDelta = hakemPoints * multiplier;
    const opponentDelta = opponentPoints * multiplier;
    return biddingTeam === 'teamA'
      ? { teamAScoreDelta: hakemDelta, teamBScoreDelta: opponentDelta, isSuccess: true, isUnderHalfBid: false }
      : { teamAScoreDelta: opponentDelta, teamBScoreDelta: hakemDelta, isSuccess: true, isUnderHalfBid: false };
  }

  // Hakem FAILED to make their bid:
  // Check the half-bid rule: Hakem must win at least half of their bid; otherwise Negative Shelem!
  const halfBid = bidAmount / 2;
  const isUnderHalf = settings.requireHalfBidForHakem !== false && hakemPoints < halfBid;

  if (isUnderHalf) {
    // Negative Shelem for Hakem (-shelemValue), and Opponent gets equal positive score (+shelemValue)
    return biddingTeam === 'teamA'
      ? { teamAScoreDelta: -shelemValue, teamBScoreDelta: shelemValue, isSuccess: false, isUnderHalfBid: true }
      : { teamAScoreDelta: shelemValue, teamBScoreDelta: -shelemValue, isSuccess: false, isUnderHalfBid: true };
  }

  // Hakem won at least half of bid (>= halfBid), but did not reach the bid:
  // Normal failure penalty
  const penalty = (settings.penaltyType === 'doubleBid' ? bidAmount * 2 : bidAmount) * multiplier;
  const opponentDelta =
    settings.opponentScoreOnFail === 'bidAmount'
      ? bidAmount * multiplier
      : opponentPoints * multiplier;

  return biddingTeam === 'teamA'
    ? { teamAScoreDelta: -penalty, teamBScoreDelta: opponentDelta, isSuccess: false, isUnderHalfBid: false }
    : { teamAScoreDelta: opponentDelta, teamBScoreDelta: -penalty, isSuccess: false, isUnderHalfBid: false };
}

/**
 * Re-computes cumulative totals for all rounds in sequence
 */
export function recalculateAllRounds(rounds: Round[], settings: GameSettings): Round[] {
  let currentTotalA = 0;
  let currentTotalB = 0;

  return rounds.map((r, index) => {
    const deltas = calculateRoundDeltas(
      r.biddingTeam,
      r.bidAmount,
      r.teamAPointsEarned,
      r.isShelem,
      r.isReverseShelem,
      r.isDouble,
      settings,
      r.isBidShelem
    );

    currentTotalA += deltas.teamAScoreDelta;
    currentTotalB += deltas.teamBScoreDelta;

    return {
      ...r,
      roundNumber: index + 1,
      isUnderHalfBid: deltas.isUnderHalfBid,
      teamAScoreDelta: deltas.teamAScoreDelta,
      teamBScoreDelta: deltas.teamBScoreDelta,
      teamATotalAfter: currentTotalA,
      teamBTotalAfter: currentTotalB,
    };
  });
}

/**
 * Determines current dealer given initial dealer and round index
 */
export function getDealerForRound(initialDealer: TeamId, roundIndex: number): TeamId {
  if (roundIndex % 2 === 0) {
    return initialDealer;
  }
  return initialDealer === 'teamA' ? 'teamB' : 'teamA';
}
