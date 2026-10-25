import { europePack, europeShapes } from './europe';
import type { GeographyPack } from './engine';

export const DIFFICULTIES = ['easy', 'normal', 'difficult'] as const;
export type Difficulty = typeof DIFFICULTIES[number];
export const DEFAULT_DIFFICULTY: Difficulty = 'normal';
export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some(level => level === value);
}

// Projected outline area reflects tap-target size on this map, not total land area.
const largest = [...europeShapes].sort((a, b) => b.area - a.area).slice(0, 7).map(shape => shape.id);
const mediumOrLarger = europeShapes.filter(shape => shape.area >= 700).map(shape => shape.id);
export function difficultyPack(difficulty: Difficulty): GeographyPack {
  if (difficulty === 'difficult') return europePack;
  const ids = difficulty === 'easy' ? largest : mediumOrLarger;
  return { ...europePack, locations: europePack.locations.filter(location => ids.includes(location.id)) };
}
