import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { CountryInfoCard } from '../features/geography/CountryInfoCard';
import { EuropeMap } from '../features/geography/EuropeMap';
import { gameCopy } from '../features/geography/copy';
import { CLUE_COLORS } from '../features/geography/mapColors';
import { difficultyPack } from '../features/geography/difficulty';
import { europePack } from '../features/geography/europe';
import { europeBorderDistanceKm } from '../features/geography/borderDistance';
import { selectionAlternatives } from '../features/geography/selection';
import { guess, startRound, type GuessResult, type Round } from '../features/geography/engine';
import { recordSession, scoreRound, sessionFromRound, summary } from '../features/geography/progress';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { useCountrySpeech } from '../features/geography/useCountrySpeech';
import { capitalName, countryName, countryFacts } from '../features/geography/countryFacts';
import { practiceTarget, recordPractice } from '../features/geography/learning';
import { canRevealNames, replayCountryId, answerChoices, nameItAnswer, type GameMode, type FindClue, type NameAnswer, findClueForRound } from '../features/geography/modes';

export function GeographyGameScreen({ mode, onBack, findClue = 'mixed', nameAnswer = 'country' }: { mode: GameMode; onBack: () => void; findClue?: FindClue; nameAnswer?: NameAnswer }) {
  const { language } = useLanguage();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  const { progress, status, update } = useProgress();
  const difficulty = progress.difficulty;
  const pack = useMemo(() => mode === 'learn' ? europePack : difficultyPack(difficulty), [mode, difficulty]);
  const practiceId = mode === 'hot-cold' ? europePack.id : `${europePack.id}:${mode}`;
  const newRound = (previousId?: string) => {
    const id = practiceTarget(pack, progress.learning, practiceId, progress.practiceMode, previousId);
    return startRound(pack, () => (pack.locations.findIndex(l => l.id === id) + 0.5) / pack.locations.length);
  };
  const [showBorders, setShowBorders] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [round, setRound] = useState<Round>(() => newRound());
  const [roundIndex, setRoundIndex] = useState(0);
  const clue = mode === 'capital-find' ? 'capital' : findClueForRound(findClue, roundIndex);
  const answerType = mode === 'capital-name' ? 'capital' : nameAnswer;
  const [feedback, setFeedback] = useState<{ id: string; result: GuessResult } | null>(null);
  const progressLoaded = status !== 'loading' && status !== 'read-error';
  const soundEnabled = progress.voiceEnabled;
  const stats = useMemo(() => summary(progress, mode === 'hot-cold' ? europePack.id : `${europePack.id}:${mode}`, difficulty), [progress, mode, difficulty]);
  const completed = mode !== 'learn' && round.completedAt !== undefined;
  const target = europePack.locations.find(item => item.id === round.targetId)!;
  const choices = useMemo(() => mode === 'name-it' || mode === 'capital-name' ? answerChoices(pack, round.targetId) : [], [mode, round.targetId, pack]);
  const distanceResolver = europeBorderDistanceKm;
  const { speak, stop, failed: speechFailed } = useCountrySpeech(soundEnabled && progressLoaded, language);
  const restart = () => {
    stop();
    setRound(newRound(round.targetId));
    setRoundIndex(value => value + 1);
    setFeedback(null);
    setShowNames(false);
  };

  const completeRound = useCallback((nextRound: Round) => {
    if (nextRound.completedAt !== undefined && progressLoaded) {
      const session = sessionFromRound(nextRound, difficulty);
      update(current => recordSession(current, { ...session, packId: mode === 'hot-cold' ? session.packId : `${session.packId}:${mode}` }));
    }
  }, [progressLoaded, update, mode, difficulty]);

  const selectCountry = useCallback((id: string) => {
    if (!progressLoaded) return;
    const location = pack.locations.find(item => item.id === id);
    if (!location) return;
    if (mode === 'name-it' || mode === 'capital-name') return; // Multiple-choice modes use four answers.
    if (mode === 'learn') {
      setFeedback({ id: location.id, result: 'correct' });
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
        const item = europePack.locations.find(location => location.id === feedback.id);
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
    for (const id of round.guesses) {
      const picked = guess(pack, { ...round, guesses: [], completedAt: undefined }, id, distanceResolver);
      results.set(id, picked.result);
    }
    return results;
  }, [round, mode, feedback, distanceResolver, pack]);

  const completedIds = mode === 'learn' ? [...resultById.keys()] : round.guesses;
  const canShowNames = canRevealNames(mode, completed);
  const replayId = replayCountryId(mode, target.id, feedback?.id);
  const modeStyle = theme.mode[mode];
  const prompt = completed ? c.correct
    : mode === 'find-it' ? clue === 'flag' ? c.flagPrompt : clue === 'capital' ? `${c.capitalFindPrompt} ${capitalName(target.id, language)}` : `${c.findPrompt} ${countryName(target.id, language)}`
    : mode === 'capital-find' ? `${c.capitalFindPrompt} ${capitalName(target.id, language)}`
    : mode === 'capital-name' ? `${c.capitalNamePrompt} ${countryName(target.id, language)}`
    : mode === 'name-it' ? answerType === 'capital' ? `${c.capitalNamePrompt} ${countryName(target.id, language)}` : c.namePrompt : mode === 'learn' ? c.learnPrompt : c.hiddenPrompt;
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.back} onPress={onBack} style={styles.iconButton}><Ionicons name="arrow-back" size={22} color={theme.navy} /></Pressable>
      <View style={styles.heading}><Ionicons name={modeStyle.icon} color={modeStyle.foreground} size={22} /><Text style={styles.modeTitle}>{c.modes[mode].title}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={soundEnabled ? c.mute : c.unmute} style={styles.iconButton}
        disabled={!progressLoaded} onPress={() => update(current => ({ ...current, voiceEnabled: !current.voiceEnabled }))}>
        <Ionicons name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'} size={22} color={theme.navy} />
      </Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {mode !== 'learn' && <Text style={styles.history}>{c.levels[difficulty]} · {c.levelHints[difficulty]}</Text>}
      <View style={styles.promptRow}>
        <Text style={styles.prompt}>{progressLoaded ? prompt : c.loading}</Text>
        {mode !== 'learn' && <View style={styles.attempts}><Text style={styles.attemptLabel}>{c.attempts}</Text><Text style={styles.attemptValue}>{round.guesses.length}</Text></View>}
      </View>
      {mode === 'find-it' && clue === 'flag' && <View style={styles.flagPrompt} accessible accessibilityLabel={c.flagPrompt}>
        <SvgXml xml={countryFacts[target.id]?.flagSvg ?? ''} width={112} height={76} />
      </View>}
      <EuropeMap key={`${mode}:${round.startedAt}:${round.targetId}`} results={resultById} revealedIds={completedIds} showNames={showNames && canShowNames}
        atlas={mode === 'learn'} showBorders={showBorders} selectableIds={mode === 'learn' ? undefined : pack.locations.map(location => location.id)} onSelect={selectCountry} enabled={progressLoaded && mode !== 'name-it' && mode !== 'capital-name'} language={language} targetId={(mode === 'name-it' || mode === 'capital-name') && !completed ? target.id : undefined} />
      {mode !== 'name-it' && mode !== 'capital-name' && (mode === 'learn' || difficulty === 'difficult') && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.markers}>
        <Text style={styles.markerLabel}>{c.smallCountries}</Text>
        {selectionAlternatives.map((country, index) => <Pressable key={country.id} accessibilityRole="button"
          accessibilityLabel={showNames || completedIds.includes(country.id) ? countryName(country.id, language) : `${c.marker} ${index + 1}`}
          disabled={!progressLoaded} onPress={() => selectCountry(country.id)} style={styles.marker}>
          <Text style={styles.markerText}>#{index + 1}{showNames || completedIds.includes(country.id) ? ` ${countryName(country.id, language)}` : ''}</Text>
        </Pressable>)}
      </ScrollView>}
      {(mode === 'name-it' || mode === 'capital-name') && <View style={styles.options}>
        {choices.map(option => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ disabled: completed || round.guesses.includes(option.id) || !progressLoaded }}
          disabled={completed || round.guesses.includes(option.id) || !progressLoaded} onPress={() => selectAnswer(option.id)}
          style={[styles.option, round.guesses.includes(option.id) && (option.id === round.targetId ? styles.optionCorrect : styles.optionWrong)]}><Text style={styles.optionText}>{answerType === 'capital' ? capitalName(option.id, language) : countryName(option.id, language)}</Text></Pressable>)}
      </View>}
      {mode === 'learn' && feedback ? <CountryInfoCard id={feedback.id} language={language} onSpeak={() => speak(countryName(feedback.id, language))} /> : <View style={styles.feedback} accessibilityLiveRegion="polite">
        <View style={styles.feedbackCopy}>
          <Text style={styles.feedbackTitle}>{(feedback ? countryName(feedback.id, language) : null) ?? (mode === 'learn' ? c.countryDetails : c.modes[mode].title)}</Text>
          <Text style={styles.feedbackText}>{feedback ? (mode === 'hot-cold' ? c.proximity[feedback.result] : mode === 'learn' ? c.learnHint : feedback.result === 'correct' ? c.correct : c.retry) : mode === 'learn' ? c.learnHint : c.modes[mode].description}</Text>
        </View>
        {replayId && <Pressable accessibilityRole="button" accessibilityLabel={c.hear}
          onPress={() => speak(mode === 'capital-find' || (mode === 'find-it' && clue === 'capital') ? capitalName(replayId, language) : countryName(replayId, language))} style={styles.iconButton}><Ionicons name="volume-high-outline" size={24} color={theme.brand} /></Pressable>}
      </View>}
      {mode === 'hot-cold' && <View style={styles.legend}>
        {(['very-far', 'far', 'close', 'very-close', 'correct'] as const).map(result => <View key={result} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: CLUE_COLORS[result] }]} /><Text style={styles.legendText}>{c.proximity[result]}</Text>
        </View>)}
      </View>}
      {mode === 'learn' && <Pressable accessibilityRole="button" accessibilityState={{ selected: showBorders }} style={styles.secondary} onPress={() => setShowBorders(value => !value)}><Text style={styles.secondaryText}>{showBorders ? c.hideBorders : c.showBorders}</Text></Pressable>}
      {canShowNames && <Pressable accessibilityRole="button" onPress={() => setShowNames(value => !value)} style={styles.secondary}>
        <Text style={styles.secondaryText}>{showNames ? c.hideNames : c.showNames}</Text>
      </Pressable>}
      {completed && <Text style={styles.score}>+{scoreRound(round.guesses.length)} {c.score}</Text>}
      {mode !== 'learn' && <Pressable accessibilityRole="button" disabled={!progressLoaded} style={styles.primary} accessibilityLabel={completed ? c.next : c.restart} onPress={restart}>
        <Ionicons name="refresh-outline" size={20} color="#FFF" /><Text style={styles.primaryText}>{completed ? c.next : c.restart}</Text>
      </Pressable>}
      {speechFailed && <Text accessibilityRole="alert" style={styles.warning}>{c.speechError}</Text>}
      <ProgressStatus language={language} />
      {mode !== 'learn' && <Text style={styles.history}>{c.history} · {c.solved}: {stats.played} · {c.best}: {stats.bestScore}</Text>}
    </ScrollView>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  flagPrompt: { backgroundColor: theme.surface, borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center', minHeight: 108 },
  screen: { flex: 1, backgroundColor: theme.paper },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E1EAF3' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, modeTitle: { fontSize: 16, fontWeight: '800', color: theme.navy },
  body: { padding: 12, gap: 10, width: '100%', maxWidth: 864, alignSelf: 'center', paddingBottom: 16 },
  promptRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
  prompt: { flex: 1, color: theme.navy, fontSize: 20, fontWeight: '800' },
  attempts: { alignItems: 'center', minWidth: 54 }, attemptLabel: { color: theme.muted, fontSize: 10 }, attemptValue: { fontSize: 21, fontWeight: '800', color: theme.navy },
  markers: { gap: 5, alignItems: 'center' }, markerLabel: { color: theme.muted, fontSize: 10, marginRight: 2 },
  marker: { minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, backgroundColor: theme.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  markerText: { fontSize: 11, color: theme.brandDark, fontWeight: '700' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { flexGrow: 1, flexBasis: '46%', minHeight: 48, padding: 12, justifyContent: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }, optionCorrect: { backgroundColor: '#DCFCE7', borderColor: '#15803D' }, optionText: { color: theme.navy, fontWeight: '600', fontSize: 14 },
  feedback: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 12, borderRadius: 16, gap: 8 }, feedbackCopy: { flex: 1, gap: 4 },
  feedbackTitle: { color: theme.navy, fontSize: 17, fontWeight: '800' }, feedbackText: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 }, swatch: { width: 9, height: 9, borderRadius: 5 }, legendText: { color: theme.muted, fontSize: 10 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 14, backgroundColor: theme.brand }, primaryText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  secondary: { minHeight: 44, justifyContent: 'center', alignItems: 'center' }, secondaryText: { color: theme.brand, fontWeight: '700', fontSize: 13 },
  score: { color: '#15803D', textAlign: 'center', fontWeight: '800', fontSize: 18 }, warning: { color: '#AA3131', fontSize: 12 }, history: { color: theme.muted, textAlign: 'center', fontSize: 10, lineHeight: 15 },
});
