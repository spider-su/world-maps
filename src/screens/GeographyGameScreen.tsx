import { explorerProgress, explorerReward } from '../features/geography/explorerProgress';
import { profileCopy } from '../features/geography/profileCopy';
import { polishCopy } from '../features/geography/polishCopy';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useMusic } from '../features/music/MusicContext';
import { completionCue } from '../features/music/soundPolicy';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { playLayout } from '../features/geography/playLayout';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { OptionsSheet } from '../ui/OptionsSheet';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { CountryInfoCard, CountryInfoHeading } from '../features/geography/CountryInfoCard';
import { EuropeMap } from '../features/geography/EuropeMap';
import { gamePrompt, gameCopy } from '../features/geography/copy';
import { CLUE_COLORS } from '../features/geography/mapColors';
import { difficultyPack } from '../features/geography/difficulty';
import { maps, type MapDefinition } from '../features/geography/maps';
import { borderDistanceFor } from '../features/geography/borderDistance';
import { classifyGuess, guess, startRoundFor, type GuessResult, type Round } from '../features/geography/engine';
import { recordExploration, recordSession, scoreRound, sessionFromRound, summary } from '../features/geography/progress';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { useCountrySpeech } from '../features/geography/useCountrySpeech';
import { capitalName, countryName, countryFacts } from '../features/geography/countryFacts';
import { practiceTarget, recordPractice } from '../features/geography/learning';
import { canRevealNames, canReplayPrompt, replayCountryId, answerChoices, modePackId, nameItAnswer, type GameMode, type FindClue, type NameAnswer, findClueForRound } from '../features/geography/modes';

export function GeographyGameScreen({ mode, onBack, findClue = 'mixed', nameAnswer = 'country', map = maps.europe }: { map?: MapDefinition; mode: GameMode; onBack: () => void; findClue?: FindClue; nameAnswer?: NameAnswer }) {
  const { language } = useLanguage();
  const { setLearning, playEffect } = useMusic();
  useFocusEffect(useCallback(() => {
    setLearning(mode === 'learn');
    return () => setLearning(false);
  }, [mode, setLearning]));
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  const p = polishCopy[language];
  const pc = profileCopy[language];
  const { progress, status, update } = useProgress();
  const difficulty = progress.difficulty;
  const pack = useMemo(() => mode === 'learn' ? map.pack : difficultyPack(difficulty, map), [mode, difficulty, map]);
  const practiceId = modePackId(map.pack.id, mode);
  const newRound = (previousId?: string) =>
    startRoundFor(pack, practiceTarget(pack, progress.learning, practiceId, progress.practiceMode, previousId));
  const { width, height, fontScale } = useWindowDimensions();
  const [showOptions, setShowOptions] = useState(false);
  const [showMapTools, setShowMapTools] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBorders, setShowBorders] = useState(true);
  const [showNames, setShowNames] = useState(mode === 'learn');
  const [round, setRound] = useState<Round>(() => newRound());
  const [rewardStart, setRewardStart] = useState(() => explorerProgress(progress));
  const [roundIndex, setRoundIndex] = useState(0);
  const clue = mode === 'capital-find' ? 'capital' : findClueForRound(findClue, roundIndex);
  const answerType = mode === 'capital-name' ? 'capital' : nameAnswer;
  const [feedback, setFeedback] = useState<{ id: string; result: GuessResult } | null>(null);
  const progressLoaded = status !== 'loading' && status !== 'read-error';
  const soundEnabled = progress.voiceEnabled;
  const stats = useMemo(() => summary(progress, practiceId, difficulty), [progress, practiceId, difficulty]);
  const completed = mode !== 'learn' && round.completedAt !== undefined;
  const target = map.pack.locations.find(item => item.id === round.targetId)!;
  const choices = useMemo(() => mode === 'name-it' || mode === 'capital-name' ? answerChoices(pack, round.targetId) : [], [mode, round.targetId, pack]);
  const distanceResolver = useMemo(() => borderDistanceFor(map), [map]);
  const { speak, stop, failed: speechFailed } = useCountrySpeech(soundEnabled && progressLoaded, language);
  const restart = () => {
    stop();
    setRound(newRound(round.targetId));
    setRewardStart(explorerProgress(progress));
    setRoundIndex(value => value + 1);
    setFeedback(null);
    setShowNames(false);
  };

  const completeRound = useCallback((nextRound: Round) => {
    if (nextRound.completedAt !== undefined && progressLoaded) {
      const session = sessionFromRound(nextRound, difficulty);
      update(current => recordSession(current, { ...session, packId: modePackId(session.packId, mode) }));
      const cue = completionCue(mode, nextRound.guesses.length);
      if (cue) playEffect(cue);
    }
  }, [progressLoaded, update, mode, difficulty, playEffect]);

  const selectCountry = useCallback((id: string) => {
    if (!progressLoaded) return;
    const location = pack.locations.find(item => item.id === id);
    if (!location) return;
    if (mode === 'name-it' || mode === 'capital-name') return; // Multiple-choice modes use four answers.
    if (mode === 'learn') {
      setFeedback({ id: location.id, result: 'correct' });
      update(current => recordExploration(current, location.id));
      speak(countryName(location.id, language));
      return;
    }
    if (round.completedAt !== undefined) return;
    try {
      const picked = guess(pack, round, id, distanceResolver);
      if (!picked.repeated) update(current => ({ ...current, learning: recordPractice(current.learning, practiceId, round, id, Date.now()) }));
      setRound(picked.round);
      setFeedback({ id: picked.location.id, result: picked.result });
      if (!picked.repeated && picked.round.completedAt !== undefined) completeRound(picked.round);
      speak(countryName(picked.location.id, language));
    } catch {
      // Reject invalid country IDs without losing game state.
    }
  }, [round, mode, progressLoaded, distanceResolver, completeRound, speak, language, update, practiceId, pack]);

  const selectAnswer = useCallback((id: string) => {
    if ((mode !== 'name-it' && mode !== 'capital-name') || !progressLoaded || completed) return;
    const answer = nameItAnswer(round, id);
    const location = pack.locations.find(item => item.id === id);
    if (!location) return;
    if (!answer.repeated) update(current => ({ ...current, learning: recordPractice(current.learning, practiceId, round, id, Date.now()) }));
    setRound(answer.round);
    setFeedback({ id: location.id, result: answer.correct ? 'correct' : 'far' });
    if (answer.correct && !answer.repeated) completeRound(answer.round);
    speak(answerType === 'capital' ? capitalName(location.id, language) : countryName(location.id, language));
  }, [mode, round, completed, progressLoaded, completeRound, speak, language, update, practiceId, pack, answerType]);

  const resultById = useMemo(() => {
    const results = new Map<string, GuessResult>();
    if (mode === 'learn') {
      if (feedback) {
        const item = map.pack.locations.find(location => location.id === feedback.id);
        if (item) results.set(item.id, 'correct');
      }
      return results;
    }
    if (mode === 'name-it' || mode === 'capital-name') {
      results.set(round.targetId, 'correct');
      return results;
    }
    if (mode === 'find-it' || mode === 'capital-find') {
      for (const id of round.guesses) results.set(id, id === round.targetId ? 'correct' : 'far');
      return results;
    }
    for (const id of round.guesses) results.set(id, classifyGuess(pack, round.targetId, id, distanceResolver).result);
    return results;
  }, [round, mode, feedback, distanceResolver, pack, map]);

  const completedIds = mode === 'learn' ? [...resultById.keys()] : round.guesses;
  const canShowNames = canRevealNames(mode, completed);
  const replayId = replayCountryId(mode, target.id, feedback?.id);
  const modeStyle = theme.mode[mode];
  const reward = completed ? explorerReward(rewardStart, explorerProgress(progress)) : null;
  const insets = useSafeAreaInsets();
  const { dockHeight, promptHeight } = playLayout(height - insets.top - insets.bottom, mode, fontScale);
  const prompt = gamePrompt(language, mode, target.id, completed, clue, answerType);
  const compactPrompt = mode === 'find-it' && clue === 'name' && !completed
    ? `${p.findCountry} ${countryName(target.id, language)}` : prompt;
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <StatusBar style="auto" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.back} onPress={onBack} style={styles.iconButton}><Ionicons name="chevron-back" size={25} color={theme.navy} /></Pressable>
      <View style={styles.heading}><Ionicons name={modeStyle.icon} color={modeStyle.foreground} size={22} /><Text style={styles.modeTitle}>{c.modes[mode].title}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={c.playOptions} style={styles.iconButton} onPress={() => setShowOptions(true)}><Ionicons name="ellipsis-horizontal" size={23} color={theme.navy} /></Pressable>
    </View>
    <View style={styles.playArea}>
      {mode === 'learn' && <Text style={styles.learnHint}>{p.selectCountry}</Text>}
      {mode !== 'learn' && <ScrollView style={[styles.promptSlot, { height: promptHeight }]} contentContainerStyle={styles.promptRow}>
        {mode === 'find-it' && clue === 'flag' && !completed && <View accessible accessibilityLabel={c.flagPrompt}><SvgXml xml={countryFacts[target.id]?.flagSvg ?? ''} width={64} height={44} /></View>}
        <Text style={styles.prompt} accessibilityLiveRegion="polite">{progressLoaded ? compactPrompt : c.loading}</Text>
        {!completed && replayId && canReplayPrompt(mode, clue, completed) && <Pressable accessibilityRole="button" accessibilityLabel={c.hear} style={styles.replay}
          onPress={() => speak(mode === 'capital-find' || (mode === 'find-it' && clue === 'capital') ? capitalName(replayId, language) : countryName(replayId, language))}>
          <Ionicons name="volume-high" size={21} color={theme.brand} />
        </Pressable>}
      </ScrollView>}
      <View style={styles.mapArea}>
        <EuropeMap map={map} key={`${mode}:${round.startedAt}:${round.targetId}`} fill toolsVisible={showMapTools} quickToolsVisible={false} results={resultById} revealedIds={completedIds} showNames={showNames && canShowNames}
          learn={mode === 'learn'} atlas={mode === 'learn'} showBorders={showBorders} selectableIds={mode === 'learn' ? undefined : pack.locations.map(location => location.id)} onSelect={selectCountry} enabled={progressLoaded && !completed && mode !== 'name-it' && mode !== 'capital-name'} language={language} targetId={(mode === 'name-it' || mode === 'capital-name') && !completed ? target.id : undefined} />

      </View>
      <ScrollView key={`${round.startedAt}:${completed ? 'result' : 'play'}`} style={[styles.dock, { height: dockHeight, flexBasis: dockHeight }]} contentContainerStyle={styles.dockContent} keyboardShouldPersistTaps="handled">
        {(mode === 'name-it' || mode === 'capital-name') && !completed && <View style={styles.options}>
          {choices.map(option => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ disabled: completed || round.guesses.includes(option.id) || !progressLoaded }}
            disabled={completed || round.guesses.includes(option.id) || !progressLoaded} onPress={() => selectAnswer(option.id)}
            style={[styles.option, width < 360 && fontScale > 1.3 && styles.optionWide, round.guesses.includes(option.id) && (option.id === round.targetId ? styles.optionCorrect : styles.optionWrong)]}><Text style={styles.optionText}>{answerType === 'capital' ? capitalName(option.id, language) : countryName(option.id, language)}</Text></Pressable>)}
        </View>}
        {mode === 'learn' && !feedback && <Text style={styles.learnHint}>{p.clusterHint}</Text>}
        {mode === 'learn' && feedback && <CountryInfoCard compact id={feedback.id} language={language} onSpeak={() => speak(countryName(feedback.id, language))} onDetails={() => setShowDetails(true)} />}
        {mode !== 'learn' && <>
          {completed && reward && reward.xp > 0 && <View accessibilityLiveRegion="polite" style={styles.reward}><Text style={styles.rewardTitle}>+{reward.xp} {pc.xp} · {p.reward}</Text>{reward.level && <Text style={styles.rewardText}>{pc.level} {reward.level}</Text>}{reward.outfit && <Text style={styles.rewardText}>{p.outfit}</Text>}{reward.badges.map(id => <Text key={id} style={styles.rewardText}>{pc.badges[id].title} · {pc.earned}</Text>)}</View>}
          {feedback && <View style={styles.feedback} accessibilityLiveRegion="polite"><View style={[styles.feedbackDot, { backgroundColor: CLUE_COLORS[feedback.result] }]} /><Text style={styles.feedbackText}>{countryName(feedback.id, language)} · {mode === 'hot-cold' ? c.proximity[feedback.result] : feedback.result === 'correct' ? c.correct : c.retry}</Text></View>}
          {mode === 'hot-cold' && !completed && <View style={styles.legend}><Text style={styles.legendText}>{c.cold}</Text>
            {(['very-far', 'far', 'close', 'very-close', 'correct'] as const).map(result => <View key={result} accessible accessibilityLabel={c.proximity[result]} style={[styles.swatch, { backgroundColor: CLUE_COLORS[result] }]} />)}
            <Text style={styles.legendText}>{c.hot}</Text>
          </View>}
          <View style={styles.scoreRow}>
          {completed && replayId && <Pressable accessibilityRole="button" accessibilityLabel={c.hear} style={styles.replay} onPress={() => speak(mode === 'capital-name' || mode === 'capital-find' || (mode === 'name-it' && answerType === 'capital') || (mode === 'find-it' && clue === 'capital') ? capitalName(replayId, language) : countryName(replayId, language))}><Ionicons name="volume-high" size={20} color={theme.brand} /></Pressable>}
            <View style={styles.metric}><Text style={styles.metricValue}>{round.guesses.length}</Text><Text style={styles.metricLabel}>{c.attempts}</Text></View>
            <View style={styles.divider} />
            <View style={styles.metric}><Text style={styles.metricValue}>{completed ? `+${scoreRound(round.guesses.length)}` : stats.bestScore}</Text><Text style={styles.metricLabel}>{completed ? c.score : c.best}</Text></View>

          </View>
        </>}
        {speechFailed && <Text accessibilityRole="alert" style={styles.warning}>{c.speechError}</Text>}
        <ProgressStatus language={language} />
      </ScrollView>
      {completed && <View style={styles.completionActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={c.back} style={styles.completionHome} onPress={onBack}>
          <Ionicons name="home-outline" size={20} color={theme.navy} />
          <Text style={styles.completionHomeText}>{c.home}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={!progressLoaded} accessibilityLabel={c.next} style={styles.completionNext} onPress={restart}>
          <Text style={styles.nextText}>{c.next}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>}
    </View>
    <OptionsSheet visible={showOptions} title={c.playOptions} closeLabel={c.close} onClose={() => setShowOptions(false)}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.mapTools} accessibilityState={{ expanded: showMapTools }} style={styles.sheetAction} onPress={() => { setShowMapTools(value => !value); setShowOptions(false); }}><Ionicons name="expand-outline" size={22} color={theme.brand} /><Text style={styles.actionText}>{c.mapTools}</Text></Pressable>
      {mode !== 'learn' && <Pressable accessibilityRole="button" accessibilityLabel={c.restart} disabled={!progressLoaded} style={styles.sheetAction} onPress={() => { restart(); setShowOptions(false); }}><Ionicons name="refresh-outline" size={22} color={theme.brand} /><Text style={styles.actionText}>{c.restart}</Text></Pressable>}
      <Pressable accessibilityRole="button" accessibilityLabel={soundEnabled ? c.mute : c.unmute} disabled={!progressLoaded} style={styles.sheetAction} onPress={() => update(current => ({ ...current, voiceEnabled: !current.voiceEnabled }))}>
        <Ionicons name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'} size={22} color={theme.brand} /><Text style={styles.actionText}>{soundEnabled ? c.mute : c.unmute}</Text>
      </Pressable>
      {canShowNames && <Pressable accessibilityRole="button" style={styles.sheetAction} onPress={() => setShowNames(value => !value)}><Ionicons name="text-outline" size={22} color={theme.brand} /><Text style={styles.actionText}>{showNames ? c.hideNames : c.showNames}</Text></Pressable>}
      {mode === 'learn' && <Pressable accessibilityRole="button" style={styles.sheetAction} onPress={() => setShowBorders(value => !value)}><Ionicons name="map-outline" size={22} color={theme.brand} /><Text style={styles.actionText}>{showBorders ? c.hideBorders : c.showBorders}</Text></Pressable>}
      <Text style={styles.sheetHint}>{p.clusterHint}</Text>
      {mode !== 'learn' && <Text style={styles.sheetHint}>{c.levels[difficulty]} · {pack.locations.length}/{map.pack.locations.length} {c.countries}{ '\n' }{c.history} · {c.solved}: {stats.played}</Text>}
      <ProgressStatus language={language} />
    </OptionsSheet>
    <OptionsSheet heading={feedback ? <CountryInfoHeading id={feedback.id} language={language} onSpeak={() => speak(countryName(feedback.id, language))} /> : undefined} visible={showDetails && !!feedback} title={c.moreDetails} closeLabel={c.close} onClose={() => setShowDetails(false)}>
      {mode === 'learn' && feedback && <CountryInfoCard showHeader={false} id={feedback.id} language={language} onSpeak={() => speak(countryName(feedback.id, language))} />}
    </OptionsSheet>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.ocean },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, minHeight: 52, gap: 6 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }, modeTitle: { fontSize: 16, fontWeight: '800', color: theme.navy, flexShrink: 1 },
  playArea: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center', paddingBottom: 8, gap: 0 },
  learnHint: { color: theme.muted, fontSize: 12, textAlign: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  promptSlot: { flexGrow: 0, flexShrink: 0, marginHorizontal: 12, marginVertical: 3, backgroundColor: theme.surface, borderRadius: 16 },
  reward: { gap: 3 }, rewardTitle: { color: theme.brand, fontSize: 14, fontWeight: '800' }, rewardText: { color: theme.navy, fontSize: 12 },
  learnIntro: { gap: 8 },
  promptRow: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.surface, borderRadius: 16, minHeight: 52 },
  prompt: { flex: 1, color: theme.navy, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  replay: { width: 44, minHeight: 44, borderRadius: 20, backgroundColor: theme.ocean, alignItems: 'center', justifyContent: 'center' },
  mapArea: { flex: 1, minHeight: 180 },
  dock: { marginHorizontal: 12, flexGrow: 0, flexShrink: 0, backgroundColor: theme.surface, borderRadius: 18 },
  dockContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 5 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexGrow: 1, flexBasis: '46%', minHeight: 48, padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.paper, borderRadius: 14, borderWidth: 1, borderColor: theme.border },
  optionWide: { flexBasis: '100%' },
  optionWrong: { backgroundColor: theme.answerWrong, borderColor: theme.error }, optionCorrect: { backgroundColor: theme.answerRight, borderColor: theme.success }, optionText: { color: theme.navy, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8 }, feedbackDot: { width: 8, height: 8, borderRadius: 4 }, feedbackText: { color: theme.navy, flex: 1, fontSize: 13, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, legendText: { color: theme.muted, fontSize: 10 }, swatch: { width: 10, height: 10, borderRadius: 5 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }, metric: { flex: 1, minWidth: 64, alignItems: 'center', gap: 2 }, metricValue: { color: theme.navy, fontSize: 18, fontWeight: '800' }, metricLabel: { color: theme.muted, fontSize: 10 },
  divider: { height: 26, width: 1, backgroundColor: theme.border, opacity: 0.4 },
  completionActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  completionHome: { flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  completionHomeText: { color: theme.navy, fontSize: 14, fontWeight: '700' },
  completionNext: { flex: 2, minHeight: 52, borderRadius: 16, backgroundColor: theme.brandDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  nextText: { flexShrink: 1, color: '#FFF', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  sheetAction: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }, actionText: { color: theme.navy, fontWeight: '700' }, sheetHint: { color: theme.muted, fontSize: 12, lineHeight: 20 },
  warning: { color: theme.error, fontSize: 12, lineHeight: 18 },
});
