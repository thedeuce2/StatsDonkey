// src/types/game.ts

export type HitType = 'fly_ball' | 'ground_ball' | 'line_drive' | 'pop_up';
export type HitVelocity = 'soft' | 'average' | 'hard';
export type AtBatResult = 
  | 'single' 
  | 'double' 
  | 'triple' 
  | 'hr' 
  | 'walk' 
  | 'flyout' 
  | 'groundout' 
  | 'k' 
  | 'reach_on_error' 
  | 'fielder_choice';

export interface Advancement {
  from: number; // 0=home, 1=first, 2=second, 3=third
  to: number;   // 1, 2, 3, 4 (4=home/scored)
  method: 'hit' | 'error' | 'fielder_choice' | 'steal' | 'passed_ball';
}

export interface PlayState {
  inning: number;
  isTopInning: boolean;
  outs: number;
  scoreHome: number;
  scoreAway: number;
  runners: (string | null)[]; // [first, second, third] player IDs
  lineupHome: string[];       // array of player IDs
  lineupAway: string[];
  currentBatterIdxHome: number;
  currentBatterIdxAway: number;
}
