import { GameSettings, GameState, Round, TeamId } from '../types/shelem';

export const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 2000,
  shelemBonus: 500,
  reverseShelemBonus: 500,
  penaltyType: 'bidAmount',
  allowDouble: false,
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
): { teamAScoreDelta: number; teamBScoreDelta: number; isSuccess: boolean } {
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
      };
    } else {
      return {
        teamAScoreDelta: shelemValue,
        teamBScoreDelta: -penalty,
        isSuccess: false,
      };
    }
  }

  // Case 2: Team BIDS Shelem (تیمی که شلم می‌خواند)
  if (isShelemBid) {
    // If Hakem won all 185 cards (opponent = 0): Made Shelem! (+500)
    if (hakemPoints === 185 || isShelem) {
      return biddingTeam === 'teamA'
        ? { teamAScoreDelta: shelemValue, teamBScoreDelta: 0, isSuccess: true }
        : { teamAScoreDelta: 0, teamBScoreDelta: shelemValue, isSuccess: true };
    } else {
      // Hakem did NOT take all 185 (opponent took >= 5): Negative Shelem! (-500)
      return biddingTeam === 'teamA'
        ? { teamAScoreDelta: -shelemValue, teamBScoreDelta: opponentPoints * multiplier, isSuccess: false }
        : { teamAScoreDelta: opponentPoints * multiplier, teamBScoreDelta: -shelemValue, isSuccess: false };
    }
  }

  // Case 3: Team did not bid Shelem, but won all 185 cards during the hand (unannounced Shelem)
  if (isShelem || hakemPoints === 185) {
    return biddingTeam === 'teamA'
      ? { teamAScoreDelta: shelemValue, teamBScoreDelta: 0, isSuccess: true }
      : { teamAScoreDelta: 0, teamBScoreDelta: shelemValue, isSuccess: true };
  }

  // Case 4: Normal trick play
  if (biddingTeam === 'teamA') {
    const isSuccess = teamAPoints >= bidAmount;
    if (isSuccess) {
      return {
        teamAScoreDelta: teamAPoints * multiplier,
        teamBScoreDelta: teamBPoints * multiplier,
        isSuccess: true,
      };
    } else {
      const penalty = (settings.penaltyType === 'doubleBid' ? bidAmount * 2 : bidAmount) * multiplier;
      return {
        teamAScoreDelta: -penalty,
        teamBScoreDelta: teamBPoints * multiplier,
        isSuccess: false,
      };
    }
  } else {
    // Team B is bidding team
    const isSuccess = teamBPoints >= bidAmount;
    if (isSuccess) {
      return {
        teamAScoreDelta: teamAPoints * multiplier,
        teamBScoreDelta: teamBPoints * multiplier,
        isSuccess: true,
      };
    } else {
      const penalty = (settings.penaltyType === 'doubleBid' ? bidAmount * 2 : bidAmount) * multiplier;
      return {
        teamAScoreDelta: teamAPoints * multiplier,
        teamBScoreDelta: -penalty,
        isSuccess: false,
      };
    }
  }
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
