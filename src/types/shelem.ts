export type TeamId = 'teamA' | 'teamB';

export interface Round {
  id: string;
  roundNumber: number;
  biddingTeam: TeamId;
  bidAmount: number; // 100 to 185 or 500 (Shelem)
  teamAPointsEarned: number; // 0..185
  teamBPointsEarned: number; // 0..185
  isShelem: boolean; // Did bidding team make Shelem?
  isBidShelem?: boolean; // Did bidding team BID Shelem (500)?
  isReverseShelem: boolean; // Did defending team make Shelem (Nouse)?
  isDouble: boolean; // Double multiplier
  teamAScoreDelta: number; // calculated delta
  teamBScoreDelta: number; // calculated delta
  teamATotalAfter: number;
  teamBTotalAfter: number;
  dealer: TeamId;
  timestamp: number;
}

export interface GameSettings {
  targetScore: number; // e.g. 2000
  shelemBonus: number; // e.g. 500
  reverseShelemBonus: number; // e.g. 500
  penaltyType: 'bidAmount' | 'doubleBid'; // normal negative or double penalty
  allowDouble: boolean; // show double option in round entry
  theme: 'emerald' | 'onyx' | 'crimson' | 'navy' | 'paper' | 'amethyst';
  fontFamily: 'vazir' | 'shabnam' | 'sahel' | 'estedad' | 'system';
  fontSize: 'normal' | 'large' | 'xlarge';
  persianDigits: boolean;
}

export interface GameState {
  id: string;
  teamAName: string;
  teamBName: string;
  initialDealer: TeamId;
  rounds: Round[];
  createdAt: number;
}
