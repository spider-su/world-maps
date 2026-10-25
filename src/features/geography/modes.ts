import type { GeographyLocation, GeographyPack, Round } from './engine';
export type GameMode = 'hot-cold' | 'find-it' | 'name-it' | 'capital-find' | 'capital-name' | 'learn';
export type FindClue = 'name' | 'capital' | 'flag' | 'mixed';
export type NameAnswer = 'country' | 'capital';

export function findClueForRound(clue: FindClue, index: number): Exclude<FindClue, 'mixed'> {
  return clue === 'mixed' ? (['name', 'capital', 'flag'] as const)[index % 3]! : clue;
}

/** Legacy capital mode IDs remain valid for existing saved progress. */
export function publicMode(mode: GameMode): GameMode {
  return mode === 'capital-find' ? 'find-it' : mode === 'capital-name' ? 'name-it' : mode;
}
export const MODE_DEFINITIONS: { id: GameMode; title: string; description: string }[] = [
  { id: 'hot-cold', title: 'Hot & Cold', description: 'Find a hidden country using distance colors' },
  { id: 'find-it', title: 'Find It', description: 'Read the name and tap its country on the map' },
  { id: 'name-it', title: 'Name It', description: 'Identify the highlighted country from four names' },
  { id: 'learn', title: 'Learn', description: 'Explore freely, without a score or secret target' },
];

export function modePrompt(mode: GameMode, countryName: string): string {
  switch (mode) {
    case 'hot-cold': return 'Find the hidden country';
    case 'find-it': return `Find: ${countryName}`;
    case 'name-it': return 'Which country is highlighted?';
    case 'capital-find': return 'Find the country for the capital';
    case 'capital-name': return 'Which capital belongs to this country?';
    case 'learn': return 'Tap any country to discover its name';
  }
}

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
  return mode === 'find-it' || mode === 'capital-find' ? targetId : selectedId;
}

/** Stored pack ID for a mode's scores and learning records. Hot & Cold keeps the
 * original unsuffixed ID from when it was the only mode. Changing any of these
 * strings orphans saved progress.
 */
export function modePackId(packId: string, mode: GameMode): string {
  return mode === 'hot-cold' ? packId : `${packId}:${mode}`;
}
