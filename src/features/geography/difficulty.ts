import { maps, type MapDefinition } from './maps';
import type { GeographyPack } from './engine';

export const DIFFICULTIES = ['easy', 'normal', 'difficult'] as const;
export type Difficulty = typeof DIFFICULTIES[number];
export const DEFAULT_DIFFICULTY: Difficulty = 'normal';
export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some(level => level === value);
}

// Outline area measures visible tap size; its absolute scale varies by continent.
export function difficultyPack(difficulty: Difficulty, map: MapDefinition = maps.europe): GeographyPack {
  if (difficulty === 'difficult') return map.pack;
  const sorted = [...map.shapes].sort((a, b) => b.area - a.area);
  // Keep Normal broader than Easy even on packs dominated by a few huge outlines.
  // Small-country pickers make the remaining mainland/island targets selectable.
  const normalCount = Math.max(7, Math.ceil(map.pack.locations.length * 2 / 3), sorted.filter(s => s.area >= 700).length);
  const ids = sorted.slice(0, difficulty === 'easy' ? 7 : normalCount).map(s => s.id);
  return { ...map.pack, locations: map.pack.locations.filter(location => ids.includes(location.id)) };
}
