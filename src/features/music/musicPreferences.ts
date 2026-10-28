export const DEFAULT_MUSIC = { enabled: false, volume: 12, effectsEnabled: false };
export type MusicPreferences = typeof DEFAULT_MUSIC;
export function parseMusic(raw: string | null): MusicPreferences {
  if (!raw) return DEFAULT_MUSIC;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return DEFAULT_MUSIC;
    const entry = data as Partial<MusicPreferences>;
    return { enabled: entry.enabled === true, effectsEnabled: entry.effectsEnabled === true, volume: typeof entry.volume === 'number' && Number.isFinite(entry.volume) ? Math.max(0, Math.min(30, Math.round(entry.volume))) : DEFAULT_MUSIC.volume };
  } catch { return DEFAULT_MUSIC; }
}
