/** Cosmetic choice only; progression is always shared across explorers and maps. */
export const EXPLORERS = ['amber', 'ocean', 'forest'] as const;
export type ExplorerId = typeof EXPLORERS[number];
export const isExplorer = (value: unknown): value is ExplorerId => EXPLORERS.includes(value as ExplorerId);
export const HAIR_COLORS = { brown: '#7A4B2A', blond: '#D7AA50', red: '#A4482D' } as const;
export const EYE_COLORS = { brown: '#75472F', blue: '#2464A0', green: '#34734C' } as const;
export type ExplorerAppearance = { hair?: keyof typeof HAIR_COLORS; eyes?: keyof typeof EYE_COLORS };
export const EXPLORER_PALETTES = {
  amber: { skin: '#DDA77E', hair: '#49332B', shirt: '#0E8985', accent: '#F2AC42', sky: '#DDF2F0' },
  ocean: { skin: '#F1C8AD', hair: '#343747', shirt: '#3476BF', accent: '#EF9862', sky: '#E2EFFC' },
  forest: { skin: '#976249', hair: '#252B31', shirt: '#617E47', accent: '#E9B94F', sky: '#ECF1DB' },
};

/** Optional v4 cosmetic fields: older records keep their original portrait colours. */
export function parseExplorerAppearance(value: unknown): ExplorerAppearance | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const entry = value as ExplorerAppearance;
  const hair = typeof entry.hair === 'string' && Object.hasOwn(HAIR_COLORS, entry.hair) ? entry.hair : undefined;
  const eyes = typeof entry.eyes === 'string' && Object.hasOwn(EYE_COLORS, entry.eyes) ? entry.eyes : undefined;
  return hair || eyes ? { ...(hair ? { hair } : {}), ...(eyes ? { eyes } : {}) } : undefined;
}

export function explorerColors(explorer: ExplorerId, appearance?: ExplorerAppearance) {
  return { ...EXPLORER_PALETTES[explorer],
    hair: appearance?.hair ? HAIR_COLORS[appearance.hair] : EXPLORER_PALETTES[explorer].hair,
    eyes: appearance?.eyes ? EYE_COLORS[appearance.eyes] : '#27323E',
  };
}
export const EXPLORER_STAGES = [1, 3, 6, 10, 15] as const;
export function explorerStage(level: number): number {
  return EXPLORER_STAGES.filter(unlock => level >= unlock).length - 1;
}
