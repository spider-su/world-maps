import type { GuessResult } from './engine';
export const SEA = '#D7EAFE';
export const LAND = '#E8F4E6';
export const CLUE_COLORS: Record<GuessResult, string> = {
  correct: '#22A85B', 'very-close': '#EF4444', close: '#F29443', far: '#EBC95C', 'very-far': '#5BACE0',
};
