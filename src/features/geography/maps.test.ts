import { describe, expect, it } from 'vitest';
import { MAP_IDS, maps, mapName } from './maps';
import { difficultyPack, DIFFICULTIES } from './difficulty';
import { answerChoices, modePackId, GAME_MODES } from './modes';
import { guess, startRoundFor } from './engine';
import { countryFacts } from './countryFacts';
import { borderDistanceFor } from './borderDistance';
import { initialProgress, parseProgress, recordExploration, recordSession, sessionFromRound, summary } from './progress';
import { recordPractice, parseLearning, learningSummary } from './learning';
import { pickerTargets } from './mapPicker';
import { INITIAL_VIEWPORT } from './viewport';

describe('offline continent packs', () => {
  it('ships explicit complete coverage and keeps historic Europe identity', () => {
    expect(MAP_IDS.map(id => maps[id].pack.locations.length)).toEqual([47,50,54,12,14]);
    expect(maps.europe.pack.id).toBe('europe-countries');
    expect(maps.asia.pack.locations.some(l => l.id === 'RUS')).toBe(true);
    expect(maps.oceania.pack.locations.some(l => l.id === 'KIR')).toBe(true);
  });
  for (const id of MAP_IDS) it(`${id}: all difficulties support quizzes, facts, selection and distance clues`, () => {
    const map = maps[id];
    expect(new Set(map.pack.locations.map(l => l.id)).size).toBe(map.pack.locations.length);
    for (const language of ['en','pl','ru'] as const) expect(mapName(id, language)).toBeTruthy();
    for (const location of map.pack.locations) {
      expect(countryFacts[location.id]?.flagSvg).toContain('<svg');
      expect(map.shapes.some(s => s.id === location.id && s.path) || map.markers.some(s => s.id === location.id)).toBe(true);
    }
    for (const shape of map.shapes) {
      expect(shape.labelX).toBeGreaterThanOrEqual(0); expect(shape.labelX).toBeLessThanOrEqual(864);
      expect(shape.labelY).toBeGreaterThanOrEqual(0); expect(shape.labelY).toBeLessThanOrEqual(570);
      const values = shape.path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
      values.forEach((n,i) => { expect(Number.isFinite(n)).toBe(true); expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThanOrEqual(i % 2 ? 570 : 864); });
    }
    for (const level of DIFFICULTIES) {
      const pack = difficultyPack(level,map);
      expect(pack.locations.length).toBeGreaterThanOrEqual(4);
      if (level === 'easy') expect(pack.locations).toHaveLength(7);
      if (level === 'difficult') expect(pack).toBe(map.pack);
      for (const target of pack.locations) {
        expect(answerChoices(pack,target.id)).toHaveLength(4);
        for (const other of pack.locations) {
          const resolve = borderDistanceFor(map);
          const result = guess(pack,startRoundFor(pack,target.id,1),other.id,resolve,2);
          expect(Number.isFinite(result.distanceKm)).toBe(true);
          expect(result.result === 'correct').toBe(target.id === other.id);
        }
      }
    }
  });
  it('keeps shared-border guesses close, and date-line islands near one another', () => {
    expect(maps.africa.distances!['KEN:TZA']).toBe(0);
    expect(maps.asia.distances!['CHN:IND']).toBe(0);
    const fiji = maps.oceania.shapes.find(s => s.id === 'FJI')!;
    const tonga = maps.oceania.shapes.find(s => s.id === 'TON')!;
    expect(Math.abs(fiji.labelX-tonga.labelX)).toBeLessThan(100);
    expect(maps.oceania.distances!['FJI:TON']).toBeLessThan(1000);
    const small = maps.oceania.shapes.filter(s => s.area < 700).map((s,i) => ({ id:s.id,x:s.labelX,y:s.labelY,number:i+1 }));
    const targets = pickerTargets(small,INITIAL_VIEWPORT,864,570);
    const shown = targets.flatMap(t => t.members.map(m => m.id));
    expect(shown).toContain('NRU'); expect(shown).toContain('TUV');
  });
  it('isolates completed sessions and learning across continents and modes', () => {
    let progress = initialProgress;
    for (const id of MAP_IDS) for (const mode of GAME_MODES.filter(m => m !== 'learn')) {
      const pack = maps[id].pack;
      const country = pack.locations[0]!;
      const round = startRoundFor(pack,country.id,1);
      const solved = guess(pack,round,country.id,undefined,2).round;
      const packId = modePackId(pack.id,mode);
      progress = recordSession(progress,{...sessionFromRound(solved,'normal'),packId});
      progress = {...progress,learning:recordPractice(progress.learning,packId,round,country.id,2)};
    }
    const restored = parseProgress(JSON.stringify(progress));
    for (const id of MAP_IDS) {
      for (const mode of GAME_MODES.filter(m => m !== 'learn')) expect(summary(restored,modePackId(maps[id].pack.id,mode)).played).toBe(1);
      expect(learningSummary(restored.learning,maps[id].pack.id,maps[id].pack.locations.map(l => l.id)).practiced).toBe(1);
    }
  });
  it('retains more than 100 explored countries and 47 guesses after reload', () => {
    let progress = initialProgress;
    for (const map of Object.values(maps)) for (const country of map.pack.locations) progress = recordExploration(progress,country.id);
    expect(parseProgress(JSON.stringify(progress)).explored).toEqual(progress.explored);
    expect(progress.explored.length).toBeGreaterThan(100);
    const pack = maps.africa.pack;
    const target = pack.locations[0]!;
    const round = startRoundFor(pack,target.id,1);
    let learning = {};
    for (const country of pack.locations) {
      learning = recordPractice(learning,pack.id,round,country.id,2);
      round.guesses.push(country.id);
    }
    expect(parseLearning(learning)[pack.id]![target.id]!.lastGuesses).toHaveLength(54);
  });
});
