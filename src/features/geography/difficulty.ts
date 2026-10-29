import { maps, type MapDefinition } from './maps';
import type { GeographyPack } from './engine';

export const DIFFICULTIES = ['easy', 'normal', 'difficult'] as const;
export type Difficulty = typeof DIFFICULTIES[number];
export const DEFAULT_DIFFICULTY: Difficulty = 'normal';
export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some(level => level === value);
}

// Outline area measures visible tap size in the shared 864x570 viewBox.
export function difficultyPack(difficulty: Difficulty, map: MapDefinition = maps.europe): GeographyPack {
  if (difficulty === 'difficult') return map.pack;
  const sorted = [...map.shapes].sort((a, b) => b.area - a.area);
  const ids = difficulty === 'easy' ? sorted.slice(0, 7).map(s => s.id) :
    sorted.slice(0, Math.max(4, sorted.filter(s => s.area >= 700).length)).map(s => s.id);
  return { ...map.pack, locations: map.pack.locations.filter(location => ids.includes(location.id)) };
}
