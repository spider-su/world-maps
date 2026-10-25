import type { GeographyLocation, GeographyPack, Round } from './engine';
/** Display order of the Home mode cards; localized titles live in copy.ts. */
export const GAME_MODES = ['hot-cold', 'find-it', 'name-it', 'learn'] as const;
export type GameMode = typeof GAME_MODES[number];

export function answerChoices(pack: GeographyPack, targetId: string, random: () => number = Math.random): GeographyLocation[] {
  const target = pack.locations.find(item => item.id === targetId);
  if (!target) throw new Error('Unknown target');
  const rest = pack.locations.filter(item => item.id !== targetId);
  if (rest.length < 3) throw new Error('At least four locations are required');
  // Partial Fisher-Yates: three unique distractors, then shuffle all options.
  for (let i = 0; i < 3; i++) {
    const n = i + Math.floor(Math.min(0.999999999, Math.max(0, random())) * (rest.length - i));
    [rest[i], rest[n]] = [rest[n]!, rest[i]!];
  }
  const options = [target, ...rest.slice(0, 3)];
  for (let i = options.length - 1; i > 0; i--) {
    const n = Math.floor(Math.min(0.999999999, Math.max(0, random())) * (i + 1));
    [options[i], options[n]] = [options[n]!, options[i]!];
  }
  return options;
}

export function nameItAnswer(round: Round, chosenId: string, now = Date.now()): { round: Round; correct: boolean; repeated: boolean } {
  if (round.completedAt !== undefined) return { round, correct: chosenId === round.targetId, repeated: true };
  const repeated = round.guesses.includes(chosenId);
  const correct = chosenId === round.targetId;
  return {
    correct, repeated,
    round: repeated ? round : { ...round, guesses: [...round.guesses, chosenId], completedAt: correct ? now : undefined },
  };
}

/** Quiz locations remain hidden until solved; Learn permits free label exploration. */
export function canRevealNames(mode: GameMode, completed: boolean): boolean {
  return mode === 'learn' || completed;
}

/** Find It replay remains the prompt, even after a wrong selection. */
export function replayCountryId(mode: GameMode, targetId: string, selectedId?: string): string | undefined {
  return mode === 'find-it' ? targetId : selectedId;
}

/** Stored pack ID for a mode's scores and learning records. Hot & Cold keeps the
 * original unsuffixed ID from when it was the only mode. Changing any of these
 * strings orphans saved progress.
 */
export function modePackId(packId: string, mode: GameMode): string {
  return mode === 'hot-cold' ? packId : `${packId}:${mode}`;
}
