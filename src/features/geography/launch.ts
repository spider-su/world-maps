import type { CompletedSession } from './progress';
import { GAME_MODES, modePackId, publicMode, type GameMode } from './modes';

/** Continue starts a new round on the selected map; abandoned rounds are not restored. */
export function recentQuizMode(sessions: readonly CompletedSession[], packId: string): GameMode | undefined {
  for (const session of [...sessions].reverse()) {
    const mode = [...GAME_MODES, 'capital-find', 'capital-name'] as const;
    const found = mode.find(id => id !== 'learn' && modePackId(packId, id) === session.packId);
    if (found) return publicMode(found);
  }
  return undefined;
}
