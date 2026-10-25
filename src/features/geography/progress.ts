import type { Round } from './engine';
import { DEFAULT_DIFFICULTY, isDifficulty, type Difficulty } from './difficulty';

export const MAX_HISTORY = 100;

export interface CompletedSession {
  packId: string;
  targetId: string;
  guesses: string[];
  startedAt: number;
  completedAt: number;
  score: number;
  difficulty?: Difficulty; // Older sessions used every country (Difficult).
}

export interface GameProgress {
  sessions: CompletedSession[];
  voiceEnabled: boolean;
  difficulty: Difficulty;
}

export const initialProgress: GameProgress = { sessions: [], voiceEnabled: true, difficulty: DEFAULT_DIFFICULTY };

export function scoreRound(guesses: number): number {
  if (!Number.isFinite(guesses) || guesses < 1) return 0;
  return Math.max(10, 100 - (Math.floor(guesses) - 1) * 10);
}

export function sessionFromRound(round: Round, difficulty?: Difficulty): CompletedSession {
  if (round.completedAt === undefined || round.guesses.at(-1) !== round.targetId) {
    throw new Error('Only completed rounds may be scored');
  }
  return {
    ...(difficulty ? { difficulty } : {}),
    packId: round.packId,
    targetId: round.targetId,
    guesses: [...round.guesses],
    startedAt: round.startedAt,
    completedAt: round.completedAt,
    score: scoreRound(round.guesses.length),
  };
}

export function recordSession(progress: GameProgress, session: CompletedSession): GameProgress {
  if (progress.sessions.some(value =>
    value.packId === session.packId &&
    (value.difficulty ?? 'difficult') === (session.difficulty ?? 'difficult') &&
    value.startedAt === session.startedAt &&
    value.targetId === session.targetId
  )) return progress;
  return { ...progress, sessions: [...progress.sessions, session].slice(-MAX_HISTORY) };
}

export function summary(progress: GameProgress, packId: string, difficulty?: Difficulty) {
  const sessions = progress.sessions.filter(s => s.packId === packId && (!difficulty || (s.difficulty ?? 'difficult') === difficulty));
  const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
  return {
    played: sessions.length,
    bestScore: sessions.reduce((best, session) => Math.max(best, session.score), 0),
    totalScore,
    averageGuesses: sessions.length === 0 ? 0 : sessions.reduce((sum, session) => sum + session.guesses.length, 0) / sessions.length,
  };
}

function isSession(value: unknown): value is CompletedSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<CompletedSession>;
  return (v.difficulty === undefined || isDifficulty(v.difficulty)) && typeof v.packId === 'string' && typeof v.targetId === 'string' &&
    Array.isArray(v.guesses) && v.guesses.every(id => typeof id === 'string') &&
    Number.isFinite(v.startedAt) && Number.isFinite(v.completedAt) && Number.isFinite(v.score) &&
    (v.completedAt as number) >= (v.startedAt as number) && v.guesses.at(-1) === v.targetId;
}

export function parseProgress(raw: string | null): GameProgress {
  if (!raw) return initialProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return initialProgress;
    const candidate = value as Partial<GameProgress>;
    return {
      difficulty: isDifficulty(candidate.difficulty) ? candidate.difficulty : DEFAULT_DIFFICULTY,
      voiceEnabled: typeof candidate.voiceEnabled === 'boolean' ? candidate.voiceEnabled : true,
      sessions: Array.isArray(candidate.sessions) ? candidate.sessions.filter(isSession).slice(-MAX_HISTORY) : [],
    };
  } catch {
    return initialProgress;
  }
}

