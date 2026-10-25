import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { useLanguage } from '../ui/LanguageContext';
import { worldMapsTheme as theme } from '../ui/worldMapsTheme';
import { EuropeMap } from '../features/geography/EuropeMap';
import { gameCopy } from '../features/geography/copy';
import { CLUE_COLORS } from '../features/geography/mapColors';
import { europePack } from '../features/geography/europe';
import { europeBorderDistanceKm } from '../features/geography/borderDistance';
import { microstates } from '../features/geography/microstates';
import { distanceKm, guess, startRound, type GuessResult, type Round } from '../features/geography/engine';
import { initialProgress, recordSession, scoreRound, sessionFromRound, summary, type GameProgress } from '../features/geography/progress';
import { loadProgress, saveProgress } from '../features/geography/progressStorage';
import { canRevealNames, answerChoices, nameItAnswer, type GameMode } from '../features/geography/modes';

export function GeographyGameScreen({ mode, onBack }: { mode: GameMode; onBack: () => void }) {
  const { language } = useLanguage();
  const c = gameCopy[language];
  const [showNames, setShowNames] = useState(false);
  const [round, setRound] = useState<Round>(() => startRound(europePack));
  const [feedback, setFeedback] = useState<{ name: string; result: GuessResult } | null>(null);
  const [progress, setProgress] = useState<GameProgress>(initialProgress);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const soundEnabled = progress.voiceEnabled;
  const stats = useMemo(() => summary(progress, mode === 'hot-cold' ? europePack.id : `${europePack.id}:${mode}`), [progress, mode]);
  const completed = mode !== 'learn' && round.completedAt !== undefined;
  const target = europePack.locations.find(item => item.id === round.targetId)!;
  const choices = useMemo(() => mode === 'name-it' ? answerChoices(europePack, round.targetId) : [], [mode, round.targetId]);
  const spokenLanguage = 'en-US';

  useEffect(() => {
    let active = true;
    loadProgress().then(saved => {
      if (active) setProgress(saved);
    }).catch(() => {
      if (active) setStorageWarning(true);
    }).finally(() => {
      if (active) setProgressLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const updateProgress = useCallback((next: GameProgress) => {
    setProgress(next);
    void saveProgress(next).catch(() => setStorageWarning(true));
  }, []);

  const restart = () => {
    void Speech.stop().catch(() => undefined);
    setRound(startRound(europePack));
    setFeedback(null);
    setShowNames(false);
  };

  useFocusEffect(useCallback(() => () => { void Speech.stop().catch(() => undefined); }, []));

  const distanceResolver = useCallback((a: (typeof europePack.locations)[number], b: (typeof europePack.locations)[number]) =>
    microstates.some(state => state.id === a.id || state.id === b.id)
      ? distanceKm(a, b)
      : europeBorderDistanceKm(a, b), []);

  const speak = useCallback((name: string) => {
    if (!soundEnabled) return;
    void Speech.stop().catch(() => undefined)
      .then(() => Speech.speak(name, { language: spokenLanguage, rate: 0.9 }));
  }, [soundEnabled]);

  const completeRound = useCallback((nextRound: Round) => {
    if (nextRound.completedAt !== undefined && progressLoaded) {
      const session = sessionFromRound(nextRound);
      updateProgress(recordSession(progress, { ...session, packId: mode === 'hot-cold' ? session.packId : `${session.packId}:${mode}` }));
    }
  }, [progress, progressLoaded, updateProgress, mode]);

  const selectCountry = useCallback((id: string) => {
    if (!progressLoaded) return;
    const location = europePack.locations.find(item => item.id === id);
    if (!location) return;
    if (mode === 'name-it') return; // Name It is answered using four options.
    if (mode === 'learn') {
      setFeedback({ name: location.name, result: 'correct' });
      speak(location.name);
      return;
    }
    if (round.completedAt !== undefined) return;
    try {
      const picked = guess(europePack, round, id, distanceResolver);
      setRound(picked.round);
      setFeedback({ name: picked.location.name, result: picked.result });
      if (!picked.repeated && picked.round.completedAt !== undefined) completeRound(picked.round);
      speak(picked.location.name);
    } catch {
      // Reject invalid country IDs without losing game state.
    }
  }, [round, mode, progressLoaded, distanceResolver, completeRound, speak]);

  const selectAnswer = useCallback((id: string) => {
    if (mode !== 'name-it' || !progressLoaded || completed) return;
    const answer = nameItAnswer(round, id);
    const location = europePack.locations.find(item => item.id === id);
    if (!location) return;
    setRound(answer.round);
    setFeedback({ name: location.name, result: answer.correct ? 'correct' : 'far' });
    if (answer.correct && !answer.repeated) completeRound(answer.round);
    speak(location.name);
  }, [mode, round, completed, progressLoaded, completeRound, speak]);

  const resultById = useMemo(() => {
    const results = new Map<string, GuessResult>();
    if (mode === 'learn') {
      if (feedback) {
        const item = europePack.locations.find(location => location.name === feedback.name);
        if (item) results.set(item.id, 'correct');
      }
      return results;
    }
    if (mode === 'name-it') {
      results.set(round.targetId, 'correct');
      return results;
    }
    if (mode === 'find-it') {
      for (const id of round.guesses) results.set(id, id === round.targetId ? 'correct' : 'far');
      return results;
    }
    for (const id of round.guesses) {
      const picked = guess(europePack, { ...round, guesses: [], completedAt: undefined }, id, distanceResolver);
      results.set(id, picked.result);
    }
    return results;
  }, [round, mode, feedback, distanceResolver]);

  const completedIds = mode === 'learn' ? [...resultById.keys()] : round.guesses;
  const canShowNames = canRevealNames(mode, completed);
  const modeStyle = theme.mode[mode];
  const prompt = completed ? c.correct : mode === 'find-it' ? `${c.findPrompt} ${target.name}` : mode === 'name-it' ? c.namePrompt : mode === 'learn' ? c.learnPrompt : c.hiddenPrompt;
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.back} onPress={onBack} style={styles.iconButton}><Ionicons name="arrow-back" size={22} color={theme.navy} /></Pressable>
      <View style={styles.heading}><Ionicons name={modeStyle.icon} color={modeStyle.foreground} size={22} /><Text style={styles.modeTitle}>{c.modes[mode].title}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={soundEnabled ? c.mute : c.unmute} style={styles.iconButton}
        disabled={!progressLoaded} onPress={() => updateProgress({ ...progress, voiceEnabled: !soundEnabled })}>
        <Ionicons name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'} size={22} color={theme.navy} />
      </Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <View style={styles.promptRow}>
        <Text style={styles.prompt}>{progressLoaded ? prompt : c.loading}</Text>
        {mode !== 'learn' && <View style={styles.attempts}><Text style={styles.attemptLabel}>{c.attempts}</Text><Text style={styles.attemptValue}>{round.guesses.length}</Text></View>}
      </View>
      <EuropeMap results={resultById} revealedIds={completedIds} showNames={showNames && canShowNames}
        onSelect={selectCountry} enabled={progressLoaded && mode !== 'name-it'} language={language} targetId={mode === 'name-it' ? target.id : undefined} />
      {mode !== 'name-it' && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.markers}>
        <Text style={styles.markerLabel}>{c.smallCountries}</Text>
        {microstates.map((country, index) => <Pressable key={country.id} accessibilityRole="button"
          accessibilityLabel={showNames || completedIds.includes(country.id) ? country.name : `${c.marker} ${index + 1}`}
          disabled={!progressLoaded} onPress={() => selectCountry(country.id)} style={styles.marker}>
          <Text style={styles.markerText}>#{index + 1}{showNames || completedIds.includes(country.id) ? ` ${country.name}` : ''}</Text>
        </Pressable>)}
      </ScrollView>}
      {mode === 'name-it' && <View style={styles.options}>
        {choices.map(option => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ disabled: completed || round.guesses.includes(option.id) || !progressLoaded }}
          disabled={completed || round.guesses.includes(option.id) || !progressLoaded} onPress={() => selectAnswer(option.id)}
          style={[styles.option, round.guesses.includes(option.id) && styles.optionUsed]}><Text style={styles.optionText}>{option.name}</Text></Pressable>)}
      </View>}
      <View style={styles.feedback} accessibilityLiveRegion="polite">
        <View style={styles.feedbackCopy}>
          <Text style={styles.feedbackTitle}>{feedback?.name ?? (mode === 'learn' ? c.countryDetails : c.modes[mode].title)}</Text>
          <Text style={styles.feedbackText}>{feedback ? (mode === 'hot-cold' ? c.proximity[feedback.result] : mode === 'learn' ? c.learnHint : feedback.result === 'correct' ? c.correct : c.retry) : mode === 'learn' ? c.learnHint : c.modes[mode].description}</Text>
        </View>
        {(feedback || mode === 'find-it') && <Pressable accessibilityRole="button" accessibilityLabel={c.hear}
          onPress={() => speak(feedback?.name ?? target.name)} style={styles.iconButton}><Ionicons name="volume-high-outline" size={24} color={theme.brand} /></Pressable>}
      </View>
      {mode === 'hot-cold' && <View style={styles.legend}>
        {(['very-far', 'far', 'close', 'very-close', 'correct'] as const).map(result => <View key={result} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: CLUE_COLORS[result] }]} /><Text style={styles.legendText}>{c.proximity[result]}</Text>
        </View>)}
      </View>}
      {canShowNames && <Pressable accessibilityRole="button" onPress={() => setShowNames(value => !value)} style={styles.secondary}>
        <Text style={styles.secondaryText}>{showNames ? c.hideNames : c.showNames}</Text>
      </Pressable>}
      {completed && <Text style={styles.score}>+{scoreRound(round.guesses.length)} {c.score}</Text>}
      {mode !== 'learn' && <Pressable accessibilityRole="button" disabled={!progressLoaded} style={styles.primary} onPress={restart}>
        <Ionicons name="refresh-outline" size={20} color="#FFF" /><Text style={styles.primaryText}>{completed ? c.next : c.restart}</Text>
      </Pressable>}
      {storageWarning && <Text accessibilityRole="alert" style={styles.warning}>{c.saveError}</Text>}
      {mode !== 'learn' && <Text style={styles.history}>{c.history} · {c.solved}: {stats.played} · {c.best}: {stats.bestScore}</Text>}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#E1EAF3' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, modeTitle: { fontSize: 16, fontWeight: '800', color: theme.navy },
  body: { padding: 12, gap: 10, width: '100%', maxWidth: 864, alignSelf: 'center', paddingBottom: 16 },
  promptRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
  prompt: { flex: 1, color: theme.navy, fontSize: 20, fontWeight: '800' },
  attempts: { alignItems: 'center', minWidth: 54 }, attemptLabel: { color: theme.muted, fontSize: 10 }, attemptValue: { fontSize: 21, fontWeight: '800', color: theme.navy },
  markers: { gap: 5, alignItems: 'center' }, markerLabel: { color: theme.muted, fontSize: 10, marginRight: 2 },
  marker: { minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#D5E2EC' },
  markerText: { fontSize: 11, color: theme.brandDark, fontWeight: '700' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { flexGrow: 1, flexBasis: '46%', minHeight: 48, padding: 12, justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#A6C5E5' },
  optionUsed: { opacity: 0.45 }, optionText: { color: theme.navy, fontWeight: '600', fontSize: 14 },
  feedback: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, gap: 8 }, feedbackCopy: { flex: 1, gap: 4 },
  feedbackTitle: { color: theme.navy, fontSize: 17, fontWeight: '800' }, feedbackText: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 }, swatch: { width: 9, height: 9, borderRadius: 5 }, legendText: { color: theme.muted, fontSize: 10 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 14, backgroundColor: theme.brand }, primaryText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  secondary: { minHeight: 44, justifyContent: 'center', alignItems: 'center' }, secondaryText: { color: theme.brand, fontWeight: '700', fontSize: 13 },
  score: { color: '#15803D', textAlign: 'center', fontWeight: '800', fontSize: 18 }, warning: { color: '#AA3131', fontSize: 12 }, history: { color: theme.muted, textAlign: 'center', fontSize: 10, lineHeight: 15 },
});
