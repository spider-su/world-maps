import { MAP_IDS, type MapId } from './maps';
import type { FindClue, NameAnswer } from './modes';

export interface MapQuizPreferences {
  mapId: MapId;
  findClue: FindClue;
  nameAnswer: NameAnswer;
}
export const DEFAULT_MAP_QUIZ: MapQuizPreferences = { mapId: 'europe', findClue: 'mixed', nameAnswer: 'country' };
const CLUES: readonly FindClue[] = ['name', 'capital', 'flag', 'mixed'];
const ANSWERS: readonly NameAnswer[] = ['country', 'capital'];
export function parseMapQuizPreferences(raw: string | null): MapQuizPreferences {
  if (!raw) return DEFAULT_MAP_QUIZ;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return DEFAULT_MAP_QUIZ;
    const candidate = value as Partial<MapQuizPreferences>;
    return {
      mapId: MAP_IDS.find(id => id === candidate.mapId) ?? DEFAULT_MAP_QUIZ.mapId,
      findClue: CLUES.find(id => id === candidate.findClue) ?? DEFAULT_MAP_QUIZ.findClue,
      nameAnswer: ANSWERS.find(id => id === candidate.nameAnswer) ?? DEFAULT_MAP_QUIZ.nameAnswer,
    };
  } catch { return DEFAULT_MAP_QUIZ; }
}
