import type { GeographyLocation, GeographyPack, Round } from './engine';
export type GameMode = 'hot-cold' | 'find-it' | 'name-it' | 'learn';
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
