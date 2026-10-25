import type { GeographyPack } from './engine';
import type { FindClue, GameMode, NameAnswer } from './modes';

export const CHALLENGE_LENGTH = 10;
export interface ChallengeQuestion {
  targetId: string;
  mode: Extract<GameMode, 'find-it' | 'name-it'>;
  findClue: FindClue;
  nameAnswer: NameAnswer;
}
export interface ChallengeAnswer {
  targetId: string;
  correct: boolean;
}

/** Uses existing country, capital and flag quiz variants, without duplicate country targets. */
export function challengeQuestions(pack: GeographyPack, random: () => number = Math.random): ChallengeQuestion[] {
  if (pack.locations.length === 0) throw new Error('Quick Challenge requires countries');
  const ids = pack.locations.map(country => country.id);
  for (let i = 0; i < ids.length; i++) {
    const u = Math.max(0, Math.min(0.999999999, random()));
    const j = i + Math.floor(u * (ids.length - i));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  // Easy difficulty has only seven countries: repeat after the pool is exhausted,
  // never consecutively, instead of silently overriding the selected difficulty.
  const targets = Array.from({ length: CHALLENGE_LENGTH }, (_, i) => ids[i % ids.length]!);
  return targets.map((targetId, i) => ({
    targetId,
    mode: i % 2 === 0 ? 'find-it' : 'name-it',
    findClue: (['name', 'capital', 'flag'] as const)[Math.floor(i / 2) % 3]!,
    nameAnswer: i % 4 === 1 ? 'country' : 'capital',
  }));
}
export function challengeSummary(answers: readonly ChallengeAnswer[], total = CHALLENGE_LENGTH) {
  const correct = answers.filter(answer => answer.correct).length;
  return { correct, total, accuracy: total ? Math.round(100 * correct / total) : 0, reviewIds: [...new Set(answers.filter(answer => !answer.correct).map(answer => answer.targetId))] };
}
