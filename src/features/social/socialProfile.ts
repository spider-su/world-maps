import type { GameProgress } from '../geography/progress';
import { explorerProgress } from '../geography/explorerProgress';
import { ACHIEVEMENTS } from '../geography/explorerProgress';

/** Whitelisted social information. Never upload sessions, answers, learning records or emails. */
export interface SocialProfile {
  nickname: string;
  explorer: 'amber' | 'ocean' | 'forest';
  xp: number;
  level: number;
  discovered: number;
  mastered: number;
  badges: string[];
  updatedAt: number;
}

export function validateNickname(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 2 || cleaned.length > 24 || /[\r\n<>]/.test(cleaned))
    throw new Error('Nickname must have 2–24 characters and no markup.');
  return cleaned;
}

export function sharedProfile(progress: GameProgress, nickname: string, updatedAt = Date.now()): SocialProfile {
  const journey = explorerProgress(progress);
  return {
    nickname: validateNickname(nickname),
    explorer: progress.explorer,
    xp: journey.xp,
    level: journey.level,
    discovered: journey.discovered,
    mastered: journey.mastered,
    badges: journey.achievements.filter(a => a.earned).map(a => a.id),
    updatedAt,
  };
}

/** Validate untrusted remote snapshots before rendering them. */
export function parseSocialProfile(value: unknown): SocialProfile | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const p = value as Partial<SocialProfile>;
  if (typeof p.nickname !== 'string') return null;
  try { validateNickname(p.nickname); } catch { return null; }
  if (!['amber', 'ocean', 'forest'].includes(p.explorer ?? '')) return null;
  if (![p.xp, p.level, p.discovered, p.mastered, p.updatedAt].every(n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0)) return null;
  if (p.level! < 1 || p.discovered! > 250 || p.mastered! > 250 || p.mastered! > p.discovered! || p.xp! > 100000000) return null;
  if (!Array.isArray(p.badges) || p.badges.length > ACHIEVEMENTS.length ||
    p.badges.some(id => typeof id !== 'string' || !ACHIEVEMENTS.includes(id as typeof ACHIEVEMENTS[number]))) return null;
  return p as SocialProfile;
}
