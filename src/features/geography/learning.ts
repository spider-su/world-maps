import type { GeographyPack, Round } from './engine';
import type { CompletedSession } from './progress';

export type PracticeMode = 'adaptive' | 'random';
export interface CountryLearning {
  correct: number;
  incorrect: number;
  firstTry: number;
  lastPracticed: number;
  recent: boolean[];
  lastRound: number;
  lastGuesses: string[];
}
export type LearningProgress = Record<string, Record<string, CountryLearning>>;
const empty = (): CountryLearning => ({ correct: 0, incorrect: 0, firstTry: 0, lastPracticed: 0, recent: [], lastRound: -1, lastGuesses: [] });
export const attempts = (record: CountryLearning) => record.correct + record.incorrect;
export const mastered = (record: CountryLearning) => record.firstTry >= 3 && record.recent.slice(-3).length === 3 && record.recent.slice(-3).every(Boolean);

/** Record a unique answer against the country being practiced, including misses
 * in abandoned rounds. Last-round guess IDs make rapid duplicate taps idempotent.
 */
export function recordPractice(learning: LearningProgress, packId: string, round: Round, selectedId: string, now: number): LearningProgress {
  if (round.completedAt !== undefined || round.guesses.includes(selectedId)) return learning;
  const previous = learning[packId]?.[round.targetId] ?? empty();
  const sameRound = previous.lastRound === round.startedAt;
  if (sameRound && previous.lastGuesses.includes(selectedId)) return learning;
  if (previous.lastRound > round.startedAt) return learning;
  const correct = selectedId === round.targetId;
  const lastGuesses = sameRound ? previous.lastGuesses : [];
  const next: CountryLearning = {
    correct: previous.correct + Number(correct), incorrect: previous.incorrect + Number(!correct),
    firstTry: previous.firstTry + Number(correct && round.guesses.length === 0 && lastGuesses.length === 0),
    lastPracticed: Math.max(previous.lastPracticed, now), recent: [...previous.recent, correct].slice(-10),
    lastRound: round.startedAt, lastGuesses: [...lastGuesses, selectedId],
  };
  return { ...learning, [packId]: { ...learning[packId], [round.targetId]: next } };
}

/** Version-1 sessions contain enough data to reconstruct completed-round practice.
 * Call once at migration, never on already-versioned records (which include misses
 * from incomplete rounds). The original score/history array is left untouched.
 */
export function migrateLearning(sessions: readonly CompletedSession[]): LearningProgress {
  let result: LearningProgress = {};
  for (const session of sessions) {
    const round: Round = { ...session, guesses: [], completedAt: undefined };
    for (const id of session.guesses) {
      result = recordPractice(result, session.packId, round, id, session.completedAt);
      round.guesses.push(id);
    }
  }
  return result;
}

export function parseLearning(value: unknown): LearningProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: LearningProgress = {};
  for (const [packId, countries] of Object.entries(value)) {
    if (!countries || typeof countries !== 'object' || Array.isArray(countries)) continue;
    const valid: Record<string, CountryLearning> = Object.create(null);
    for (const [id, raw] of Object.entries(countries)) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Partial<CountryLearning>;
      if (![r.correct, r.incorrect, r.firstTry, r.lastPracticed, r.lastRound].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0) ||
        r.firstTry! > r.correct! || !Array.isArray(r.recent) || !r.recent.every(v => typeof v === 'boolean') ||
        !Array.isArray(r.lastGuesses) || !r.lastGuesses.every(v => typeof v === 'string') ||
        ![r.correct, r.incorrect, r.firstTry].every(Number.isInteger)) continue;
      valid[id] = { ...r, recent: r.recent.slice(-10), lastGuesses: [...new Set(r.lastGuesses)] } as CountryLearning;
    }
    // Object.fromEntries creates data properties, including unusual imported keys.
    if (Object.keys(valid).length) Object.defineProperty(result, packId, { value: valid, enumerable: true, writable: true, configurable: true });
  }
  return result;
}

export function learningSummary(learning: LearningProgress, packId: string, ids: readonly string[]) {
  const records = ids.map(id => Object.entries(learning).filter(([key]) => key === packId || key.startsWith(`${packId}:`)).flatMap(([, countries]) => countries[id] ? [countries[id]!] : []));
  const practiced = records.filter(items => items.length > 0).length;
  const masteredCount = records.filter(items => items.some(mastered)).length;
  const needingPractice = records.filter(items => items.some(r => r.incorrect > 0) && !items.some(mastered)).length;
  const all = records.flat();
  const correct = all.reduce((sum, r) => sum + r.correct, 0);
  const total = all.reduce((sum, r) => sum + attempts(r), 0);
  return { practiced, mastered: masteredCount, needingPractice, accuracy: total ? Math.round(correct / total * 100) : 0, attempts: total };
}

export function practiceWeight(record: CountryLearning | undefined, now: number): number {
  if (!record) return 4;
  const days = Math.max(0, now - record.lastPracticed) / 86_400_000;
  const due = Math.min(3, days / 7);
  const recentMiss = record.recent.slice(-3).some(result => !result) ? 4 : 0;
  return (mastered(record) ? 0.3 : 1) + 3 * record.incorrect / Math.max(1, attempts(record)) + recentMiss + due;
}

/** Deterministic weighted draw, always within the active difficulty pool. */
export function practiceTarget(pack: GeographyPack, learning: LearningProgress, packId: string, mode: PracticeMode, previousId?: string, random: () => number = Math.random, now = Date.now()): string {
  const lastId = previousId ?? Object.entries(learning[packId] ?? {}).sort((a, b) => b[1].lastPracticed - a[1].lastPracticed)[0]?.[0];
  const candidates = pack.locations.filter(location => pack.locations.length === 1 || location.id !== lastId);
  if (!candidates.length) throw new Error('Map pack cannot be empty');
  const weights = candidates.map(location => mode === 'random' ? 1 : practiceWeight(learning[packId]?.[location.id], now));
  let choice = Math.min(0.999999999, Math.max(0, random())) * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidates.length; i++) { choice -= weights[i]!; if (choice < 0) return candidates[i]!.id; }
  return candidates.at(-1)!.id;
}
