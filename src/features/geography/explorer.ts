/** Cosmetic choice only; progression is always shared across explorers and maps. */
export const EXPLORERS = ['amber', 'ocean', 'forest'] as const;
export type ExplorerId = typeof EXPLORERS[number];
export const isExplorer = (value: unknown): value is ExplorerId => EXPLORERS.includes(value as ExplorerId);
export const EXPLORER_STAGES = [1, 3, 6, 10, 15] as const;
export function explorerStage(level: number): number {
  return EXPLORER_STAGES.filter(unlock => level >= unlock).length - 1;
}
