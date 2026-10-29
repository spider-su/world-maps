import type { GameMode } from '../geography/modes';
import type { QuizEffect } from './musicAssets';

/** One cue per completed quiz round. Never play a victory cue for a wrong guess or Learn tap. */
export function completionCue(mode: GameMode, guesses: number): QuizEffect | null {
  if (mode === 'learn' || !Number.isInteger(guesses) || guesses < 1) return null;
  return guesses === 1 ? 'complete' : 'correct';
}
