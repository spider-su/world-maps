import type { GameProgress } from './progress';
import { maps } from './maps';
import { mastered } from './learning';
import { modePackId, publicMode } from './modes';
import { EXPLORER_STAGES, explorerStage } from './explorer';

export const DISCOVERY_XP = 10;
export const CORRECT_XP = 15;
export const FIRST_TRY_XP = 5;
export const XP_PER_LEVEL = 100;
export const ACHIEVEMENTS = ['first-discovery', 'curious', 'collector', 'sharp-eye', 'all-rounder', 'globetrotter'] as const;
export type AchievementId = typeof ACHIEVEMENTS[number];

/** Derive permanent rewards from durable cumulative facts, never the last-100
 * history or current mastery. No XP balance or earned-badge copies to drift.
 */
export function explorerProgress(progress: GameProgress) {
  const definitions = Object.values(maps);
  const countries = new Set(definitions.flatMap(map => map.pack.locations.map(c => c.id)));
  const discovered = new Set(progress.explored.filter(id => countries.has(id)));
  const masteredIds = new Set<string>();
  const successfulModes = new Set<string>();
  let correct = 0, firstTry = 0;
  for (const map of definitions) {
    for (const mode of ['hot-cold', 'find-it', 'name-it', 'capital-find', 'capital-name'] as const) {
      const records = progress.learning[modePackId(map.pack.id, mode)] ?? {};
      for (const location of map.pack.locations) {
        const record = records[location.id];
        if (!record) continue;
        correct += record.correct;
        firstTry += record.firstTry;
        if (record.correct) successfulModes.add(publicMode(mode));
        if (mastered(record)) masteredIds.add(location.id);
      }
    }
  }
  const xp = discovered.size * DISCOVERY_XP + correct * CORRECT_XP + firstTry * FIRST_TRY_XP;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const stage = explorerStage(level);
  const requirements: Record<AchievementId, [number, number]> = {
    'first-discovery': [discovered.size, 1], curious: [discovered.size, 10], collector: [discovered.size, 50],
    'sharp-eye': [firstTry, 10], 'all-rounder': [successfulModes.size, 3], globetrotter: [discovered.size, 100],
  };
  const achievements = ACHIEVEMENTS.map(id => {
    const [current, target] = requirements[id];
    return { id, current: Math.min(current, target), target, earned: current >= target };
  });
  return {
    xp, level, stage, levelXP: xp % XP_PER_LEVEL, nextLevelXP: XP_PER_LEVEL - xp % XP_PER_LEVEL,
    nextOutfitLevel: EXPLORER_STAGES[stage + 1],
    nextQuizMode: (['hot-cold', 'find-it', 'name-it'] as const).find(mode => !successfulModes.has(mode)) ?? 'name-it',
    discovered: discovered.size, totalCountries: countries.size, correct, firstTry, mastered: masteredIds.size,
    achievements,
    maps: definitions.map(map => ({ id: map.id, total: map.pack.locations.length,
      discovered: map.pack.locations.filter(c => discovered.has(c.id)).length,
      mastered: map.pack.locations.filter(c => masteredIds.has(c.id)).length,
    })),
  };
}

/** Transient result copy derived from saved learning before/after a round. */
export function explorerReward(before: ReturnType<typeof explorerProgress>, after: ReturnType<typeof explorerProgress>) {
  return {
    xp: Math.max(0, after.xp - before.xp),
    level: after.level > before.level ? after.level : undefined,
    outfit: after.stage > before.stage,
    badges: after.achievements.filter(b => b.earned && !before.achievements.some(old => old.id === b.id && old.earned)).map(b => b.id),
  };
}
