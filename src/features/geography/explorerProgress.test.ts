import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress, recordExploration, recordSession, sessionFromRound, type GameProgress } from './progress';
import { recordPractice } from './learning';
import { maps } from './maps';
import { explorerProgress, explorerReward } from './explorerProgress';

const ids = [...new Set(Object.values(maps).flatMap(map => map.pack.locations.map(c => c.id)))];
function solve(progress: GameProgress, startedAt: number, packId = 'europe-countries', targetId = 'POL') {
  const round = { packId: 'europe-countries', targetId, guesses: [], startedAt };
  const learning = recordPractice(progress.learning, packId, round, targetId, startedAt + 1);
  return recordSession({ ...progress, learning }, { ...sessionFromRound({...round,guesses:[targetId],completedAt:startedAt+1}),packId });
}

describe('explorer rewards from durable learning', () => {
  it('starts at level one and rewards a country only once across overlapping maps', () => {
    expect(explorerProgress(initialProgress)).toMatchObject({xp:0,level:1,stage:0,nextLevelXP:100});
    const one = recordExploration(initialProgress,'RUS');
    const stats = explorerProgress(recordExploration(one,'RUS'));
    expect(stats.xp).toBe(10);
    expect(stats.discovered).toBe(1);
    expect(stats.maps.find(m => m.id === 'europe')?.discovered).toBe(1);
    expect(stats.maps.find(m => m.id === 'asia')?.discovered).toBe(1);
    expect(explorerProgress({...one,explored:[...one.explored,'RUS','ZZZ']})).toEqual(stats);
  });
  it('rewards solves and first tries without rewarding repeated answers or avatar changes', () => {
    const solved = solve(initialProgress,10);
    const repeated = recordPractice(solved.learning,'europe-countries',{packId:'europe-countries',targetId:'POL',guesses:[],startedAt:10},'POL',12);
    expect(explorerProgress({...solved,learning:repeated})).toMatchObject({xp:20,correct:1,firstTry:1});
    expect(explorerProgress({...solved,explorer:'forest'})).toEqual(explorerProgress(solved));
    const missedRound = {packId:'europe-countries',targetId:'DEU',guesses:[],startedAt:30};
    const missed = recordPractice(solved.learning,'europe-countries',missedRound,'FRA',31);
    expect(explorerProgress({...solved,learning:missed}).xp).toBe(20);
    const later = recordPractice(missed,'europe-countries',{...missedRound,guesses:['FRA']},'DEU',32);
    expect(explorerProgress({...solved,learning:later}).xp).toBe(35);
  });
  it('retains XP when recent history rolls past 100 rounds', () => {
    let progress = initialProgress;
    for (let i=1;i<=130;i++) progress = solve(progress,i*10);
    expect(progress.sessions).toHaveLength(100);
    expect(explorerProgress(progress)).toMatchObject({xp:2600,correct:130,level:27,stage:4});
    expect(explorerProgress({...progress,sessions:[]})).toEqual(explorerProgress(progress));
    expect(explorerProgress(parseProgress(JSON.stringify(progress)))).toEqual(explorerProgress(progress));
  });
  it('keeps earned levels and badges when current mastery falls', () => {
    let progress = {...initialProgress,explored:ids.slice(0,14)};
    for (let i=1;i<=3;i++) progress=solve(progress,i*10);
    const before=explorerProgress(progress);
    expect(before).toMatchObject({xp:200,level:3,stage:1,mastered:1});
    const learning=recordPractice(progress.learning,'europe-countries',{packId:'europe-countries',targetId:'POL',guesses:[],startedAt:100},'DEU',101);
    const after=explorerProgress({...progress,learning});
    expect(after.mastered).toBe(0);
    expect(after.xp).toBe(before.xp);
    expect(after.level).toBe(before.level);
    expect(after.achievements).toEqual(before.achievements);
  });
  it('unlocks outfit stages at explicit level boundaries', () => {
    for (const [correct,firstTry,xp,level,stage] of [[0,0,0,1,0],[13,0,195,2,0],[13,1,200,3,1],[33,0,495,5,1],[33,1,500,6,2],[59,2,895,9,2],[60,0,900,10,3],[93,0,1395,14,3],[93,1,1400,15,4]]) {
      const learning={'europe-countries':{POL:{correct:correct!,incorrect:0,firstTry:firstTry!,recent:[],lastPracticed:1,lastRound:1,lastGuesses:[]}}};
      expect(explorerProgress({...initialProgress,learning})).toMatchObject({xp,level,stage});
    }
    const progress={...initialProgress,explored:ids.slice(0,50)};
    expect(explorerProgress(progress)).toMatchObject({xp:500,level:6,stage:2,nextOutfitLevel:10});
  });
  it('requires all quiz families, counts legacy capital modes and ignores unsupported records', () => {
    let progress=solve(initialProgress,10);
    progress=solve(progress,20,'europe-countries:capital-find');
    expect(explorerProgress(progress).achievements.find(b => b.id==='all-rounder')?.earned).toBe(false);
    progress=solve(progress,30,'europe-countries:capital-name');
    const stats=explorerProgress(progress);
    expect(stats.achievements.find(b => b.id==='all-rounder')?.earned).toBe(true);
    const extra=progress.learning['europe-countries']!;
    expect(explorerProgress({...progress,learning:{...progress.learning,'unknown-pack':extra,'europe-countries:learn':extra}})).toEqual(stats);
  });
});


describe('round result presentation', () => {
  it('shows the actual earned XP and only newly earned milestones', () => {
    const progress = { ...initialProgress, explored: ids.slice(0, 18) };
    const before = explorerProgress(progress);
    const after = explorerProgress(solve(progress, 10));
    expect(explorerReward(before, after)).toEqual({ xp: 20, level: 3, outfit: true, badges: [] });
    expect(explorerReward(after, after)).toEqual({ xp: 0, level: undefined, outfit: false, badges: [] });
  });
  it('does not turn a wrong answer into XP or a new achievement', () => {
    const before = explorerProgress(initialProgress);
    const round = { packId: 'europe-countries', targetId: 'POL', guesses: [], startedAt: 1 };
    const wrong = { ...initialProgress, learning: recordPractice({}, round.packId, round, 'DEU', 2) };
    expect(explorerReward(before, explorerProgress(wrong)).xp).toBe(0);
    const solved = { ...wrong, learning: recordPractice(wrong.learning, round.packId, { ...round, guesses: ['DEU'] }, 'POL', 3) };
    expect(explorerReward(before, explorerProgress(solved)).xp).toBe(15);
  });
  it('announces a badge once at its boundary, independent of history retention', () => {
    const before = explorerProgress(solve(solve(initialProgress, 1), 2, 'europe-countries:find-it'));
    const after = explorerProgress(solve(solve(solve(initialProgress, 1), 2, 'europe-countries:find-it'), 3, 'europe-countries:name-it'));
    expect(explorerReward(before, after).badges).toEqual(['all-rounder']);
    expect(explorerReward(after, after).badges).toEqual([]);
  });
});
