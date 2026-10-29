/* eslint-disable @typescript-eslint/no-require-imports -- Metro requires statically analyzable bundled audio assets. */
import type { MapId } from '../geography/maps';

export const REGION_TRACKS: Record<MapId, number> = {
  europe: require('../../../assets/audio/europe-learn.wav'),
  asia: require('../../../assets/audio/asia-learn.wav'),
  africa: require('../../../assets/audio/africa-learn.wav'),
  'north-america': require('../../../assets/audio/north-america-learn.wav'),
  'south-america': require('../../../assets/audio/south-america-learn.wav'),
  oceania: require('../../../assets/audio/oceania-learn.wav'),
};
export const QUIZ_EFFECTS = {
  correct: require('../../../assets/audio/correct.wav'),
  complete: require('../../../assets/audio/round-complete.wav'),
} as const;
export type QuizEffect = keyof typeof QUIZ_EFFECTS;
