import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appSafeAreaEdges } from '../platform/safeArea';
import { CountryPath } from '../features/geography/CountryPath';
import { CountryMarker } from '../features/geography/CountryMarker';
import { mapLabels } from '../features/geography/mapLabels';
import { europePack, europeShapes, europeContextShapes } from '../features/geography/europe';
import { europeBorderDistanceKm } from '../features/geography/borderDistance';
import { microstates } from '../features/geography/microstates';
import { frame, INITIAL_VIEWPORT, normalize, pan, zoomAt, type Viewport } from '../features/geography/viewport';
import { distanceKm, guess, startRound, type GuessResult, type Round } from '../features/geography/engine';
import { initialProgress, recordSession, scoreRound, sessionFromRound, summary, type GameProgress } from '../features/geography/progress';
import { loadProgress, saveProgress } from '../features/geography/progressStorage';
import { canRevealNames, answerChoices, MODE_DEFINITIONS, modePrompt, nameItAnswer, type GameMode } from '../features/geography/modes';
import { ModeSelector } from '../features/geography/ModeSelector';

const SEA = '#8FD3F4';
const NEUTRAL = '#FFF3CF';
const COLORS: Record<GuessResult, string> = {
  correct: '#29B765',
  'very-close': '#E65347',
  close: '#F29443',
  far: '#F2CB64',
  'very-far': '#70B9E6',
};

// Muted default map; color is shown only for locations already guessed.
const LABELS: Record<GuessResult, string> = {
  correct: 'Found',
  'very-close': 'Very close',
  close: 'Close',
  far: 'Far',
  'very-far': 'Very far',
};

export function HotColdScreen() {
  const { width } = useWindowDimensions();
  const [showNames, setShowNames] = useState(false);
  const [mode, setMode] = useState<GameMode>('hot-cold');
  const [round, setRound] = useState<Round>(() => startRound(europePack));
  const [feedback, setFeedback] = useState<{ name: string; result: GuessResult } | null>(null);
  const [progress, setProgress] = useState<GameProgress>(initialProgress);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const soundEnabled = progress.voiceEnabled;
  const stats = useMemo(() => summary(progress, mode === 'hot-cold' ? europePack.id : `${europePack.id}:${mode}`), [progress, mode]);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const viewportRef = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  const gestureRef = useRef({ viewport, pinchDistance: 0 });
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

  const visible = useMemo(() => frame(viewport), [viewport]);
  const zoom = viewport.zoom;

  const restart = () => {
    void Speech.stop().catch(() => undefined);
    setRound(startRound(europePack));
    setFeedback(null);
    setShowNames(false);
  };

  const changeMode = (next: GameMode) => {
    if (next === mode) return;
    void Speech.stop().catch(() => undefined);
    setMode(next);
    setRound(startRound(europePack));
    setFeedback(null);
    setShowNames(false);
    setViewport(INITIAL_VIEWPORT);
  };

  useEffect(() => () => { void Speech.stop().catch(() => undefined); }, []);

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

  const mapWidth = Math.max(280, Math.min(width - 24, 680));
  const mapHeight = mapWidth * 570 / 864;
  const revealedIds = mode === 'learn' ? [...resultById.keys()] : round.guesses;
  const canShowNames = canRevealNames(mode, completed);
  const visibleLabels = mapLabels(europeShapes, showNames && canShowNames, revealedIds, visible, mapWidth);
  const labelFontSize = 11 * visible.w / mapWidth;
  const beginGesture = useCallback(() => {
    gestureRef.current = { viewport: viewportRef.current, pinchDistance: 0 };
  }, []);
  const moveGesture = useCallback<NonNullable<Parameters<typeof PanResponder.create>[0]['onPanResponderMove']>>((event, gesture) => {
    const touches = event.nativeEvent.touches;
    if (touches.length >= 2 && touches[0] && touches[1]) {
      const distance = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
      if (!gestureRef.current.pinchDistance) {
        gestureRef.current = { viewport: viewportRef.current, pinchDistance: distance };
        return;
      }
      setViewport(zoomAt(gestureRef.current.viewport, distance / gestureRef.current.pinchDistance,
        { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));
    } else if (gestureRef.current.pinchDistance) {
      gestureRef.current = { viewport: viewportRef.current, pinchDistance: 0 };
    } else {
      setViewport(pan(gestureRef.current.viewport, gesture.dx, gesture.dy, mapWidth));
    }
  }, [mapWidth, mapHeight]);
  const endGesture = useCallback(() => { gestureRef.current.pinchDistance = 0; }, []);
  // eslint-disable-next-line react-hooks/refs -- PanResponder.create stores these callbacks; gestures invoke them after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (event, gesture) =>
      event.nativeEvent.touches.length > 1 || Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
    onPanResponderGrant: beginGesture,
    onPanResponderMove: moveGesture,
    onPanResponderRelease: endGesture,
    onPanResponderTerminate: endGesture,
  }), [beginGesture, moveGesture, endGesture]);

  const adjustZoom = (factor: number) => setViewport(old =>
    zoomAt(old, factor, { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));

  return (
    <SafeAreaView edges={appSafeAreaEdges} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <ModeSelector value={mode} onChange={changeMode} />
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>EUROPE · {MODE_DEFINITIONS.find(item => item.id === mode)?.title.toUpperCase()}</Text>
            <Text style={styles.title}>{completed ? 'Correct!' : modePrompt(mode, target.name)}</Text>
            <Text style={styles.subtitle}>{completed ? 'Great work. Ready for another?' : MODE_DEFINITIONS.find(item => item.id === mode)?.description}</Text>
          </View>
          <Pressable style={styles.voiceButton} onPress={() => { if (progressLoaded) updateProgress({ ...progress, voiceEnabled: !soundEnabled }); }} accessibilityRole="button" accessibilityLabel={soundEnabled ? 'Mute voice' : 'Enable voice'}>
            <Text style={styles.voiceText}>{soundEnabled ? '🔊' : '🔇'}</Text>
          </Pressable>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{mode === 'learn' ? 'Explore freely' : 'Attempts'}  <Text style={styles.statBold}>{mode === 'learn' ? '∞' : round.guesses.length}</Text></Text>
          <Text style={styles.stat}>{completed ? 'Solved ✓' : mode === 'hot-cold' ? 'Target hidden ?' : mode === 'learn' ? 'No score' : 'Find the answer'}</Text>
        </View>
        {mode !== 'learn' && <View style={styles.progressStrip}>
          <Text style={styles.progressText}>Solved  <Text style={styles.progressValue}>{stats.played}</Text></Text>
          <Text style={styles.progressText}>Best  <Text style={styles.progressValue}>{stats.bestScore}</Text></Text>
          <Text style={styles.progressText}>Total  <Text style={styles.progressValue}>{stats.totalScore}</Text></Text>
        </View>}
        <View style={styles.mapModeRow}>
          <Text style={styles.mapModeText}>{!canShowNames ? 'Names hidden during the quiz' : showNames ? 'Names shown · zoom for more detail' : 'Names hidden · tap to discover'}</Text>
          {canShowNames && <Pressable accessibilityRole="button" accessibilityLabel={showNames ? 'Hide country names' : 'Show country names'}
            accessibilityState={{ expanded: showNames }} style={styles.namesButton} onPress={() => setShowNames(value => !value)}>
            <Text style={styles.namesButtonText}>{showNames ? 'Hide names' : 'Show names'}</Text>
          </Pressable>}
        </View>
        <View style={styles.mapCard}>
          <View {...responder.panHandlers} collapsable={false}>
          <Svg width={mapWidth} height={mapHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityLabel="Interactive map of Europe. Tap countries to guess.">
            <Rect width="864" height="570" fill={SEA} />
            {europeContextShapes.map(shape => <Path key={shape.id} d={shape.path}
              fill="#D6DDE1" stroke="#46677B" strokeWidth={0.8 / zoom} strokeLinejoin="round" />)}
            {europeShapes.map(shape => (
              <CountryPath key={shape.id} d={shape.path}
                fill={resultById.has(shape.id) ? COLORS[resultById.get(shape.id)!] : NEUTRAL}
                stroke="#46677B" strokeWidth={Math.max(0.8, 1.5 / zoom)}
                onSelect={() => selectCountry(shape.id)}
              />
            ))}
            {visibleLabels.map(location => <SvgText key={`${location.id}-label`}
              x={location.labelX} y={location.labelY} fontSize={labelFontSize}
              fontFamily="sans-serif" fontWeight="700" textAnchor="middle" fill="#183B51" pointerEvents="none">
              {location.name}
            </SvgText>)}
            {microstates.map(state => {
              const result = resultById.get(state.id);
              return <CountryMarker key={state.id} cx={state.x} cy={state.y}
                r={Math.max(2, 5 / zoom)}
                fill={result ? COLORS[result] : '#F9FAFB'} stroke="#17364A"
                strokeWidth={Math.max(0.7, 1.5 / zoom)} onSelect={() => selectCountry(state.id)} />;
            })}
            {microstates.map((state, i) => <SvgText key={`${state.id}-number`} x={state.x} y={state.y + 2.1 / zoom}
              fontSize={Math.max(4, 6 / zoom)} textAnchor="middle" fill="#15384F" pointerEvents="none">{i + 1}</SvgText>)}
            {microstates.map(state => <CountryMarker key={`${state.id}-hit`} cx={state.x} cy={state.y}
              r={Math.max(5, 24 / zoom)} fill="transparent"
              onSelect={() => selectCountry(state.id)} />)}
          </Svg>
          </View>
          <View style={styles.controls}>
            <Pressable style={styles.control} onPress={() => adjustZoom(1 / 1.5)}><Text style={styles.controlText}>−</Text></Pressable>
            <Text style={styles.zoomLabel}>{zoom.toFixed(1)}×</Text>
            <Pressable style={styles.control} onPress={() => adjustZoom(1.5)}><Text style={styles.controlText}>+</Text></Pressable>
            <Pressable style={styles.control} onPress={() => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x - 90 / v.zoom } }))}><Text style={styles.controlText}>←</Text></Pressable>
            <Pressable style={styles.control} onPress={() => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x + 90 / v.zoom } }))}><Text style={styles.controlText}>→</Text></Pressable>
            <Pressable style={styles.control} onPress={() => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y - 90 / v.zoom } }))}><Text style={styles.controlText}>↑</Text></Pressable>
            <Pressable style={styles.control} onPress={() => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y + 90 / v.zoom } }))}><Text style={styles.controlText}>↓</Text></Pressable>
          </View>
          <Text style={styles.smallCountryTitle}>SMALL COUNTRIES · NUMBERED MARKERS</Text>
          <View style={styles.microstateChips}>
            {microstates.map((country, index) => (
              <Pressable key={country.id} accessibilityRole="button" accessibilityLabel={showNames || revealedIds.includes(country.id) ? `Select ${country.name}` : `Select small country marker ${index + 1}`}
                style={styles.microstateChip} onPress={() => selectCountry(country.id)}>
                <Text style={styles.microstateChipText}>#{index + 1}{showNames || revealedIds.includes(country.id) ? ` ${country.name}` : ''}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.feedback}>
          <Text style={styles.feedbackLabel}>{feedback ? 'LAST SELECTION' : 'HOW TO PLAY'}</Text>
          <Text style={styles.feedbackTitle}>{feedback ? feedback.name : mode === 'find-it' ? target.name : mode === 'name-it' ? 'Look at the highlighted country' : 'Discover a country'}</Text>
          <Text style={styles.feedbackDescription}>{feedback ? (mode === 'find-it' || mode === 'name-it' ? (feedback.result === 'correct' ? 'Correct!' : 'Not quite, try again') : mode === 'learn' ? 'Tap another country to continue learning' : LABELS[feedback.result]) : mode === 'hot-cold' ? 'Each guess gives a distance clue. Names appear after you tap.' : MODE_DEFINITIONS.find(item => item.id === mode)?.description}</Text>
          {completed && <Text style={styles.scoreText}>+{scoreRound(round.guesses.length)} points · {round.guesses.length} {round.guesses.length === 1 ? 'guess' : 'guesses'}</Text>}
          {feedback && soundEnabled && <Pressable accessibilityRole="button" onPress={() => speak(feedback.name)}>
            <Text style={styles.replay}>▶ Hear name again</Text>
          </Pressable>}
        </View>
        {mode === 'name-it' && <View style={styles.options}>
          {choices.map(option => <Pressable key={option.id} accessibilityRole="button"
            disabled={completed || round.guesses.includes(option.id)}
            style={[styles.option, round.guesses.includes(option.id) && styles.optionUsed]}
            onPress={() => selectAnswer(option.id)}>
            <Text style={styles.optionText}>{option.name}</Text>
          </Pressable>)}
        </View>}
        {mode === 'find-it' && <Pressable style={styles.sayTarget} onPress={() => speak(target.name)}>
          <Text style={styles.sayTargetText}>🔊 Hear target: {target.name}</Text>
        </Pressable>}
        {mode === 'hot-cold' && <View style={styles.legend}>
          {(['very-far','far','close','very-close','correct'] as const).map(key =>
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendSwatch, {backgroundColor:COLORS[key]}]} />
              <Text style={styles.legendText}>{LABELS[key]}</Text>
            </View>
          )}
        </View>}
        {mode !== 'learn' && <Pressable style={styles.nextButton} onPress={restart} accessibilityRole="button">
          <Text style={styles.nextText}>{completed ? 'Next country →' : 'New hidden country ↻'}</Text>
        </Pressable>}
        {storageWarning && <Text style={styles.warning}>Progress could not be saved on this device.</Text>}
        <Text style={styles.footer}>Pinch to zoom · drag to move · tap the microstate dots · scores saved on device</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  options:{flexDirection:'row',flexWrap:'wrap',gap:8},
  option:{width:'48%',minHeight:48,backgroundColor:'#FFF',borderRadius:12,justifyContent:'center',paddingHorizontal:12,borderWidth:1,borderColor:'#A2C6D9'},
  optionUsed:{opacity:0.45},
  optionText:{fontSize:13,color:'#153C53',fontWeight:'700'},
  sayTarget:{backgroundColor:'#FFF',borderRadius:12,alignItems:'center',padding:11},
  sayTargetText:{color:'#1C567B',fontWeight:'700'},


  screen:{flex:1,backgroundColor:'#EAF3F8'},
  container:{padding:12,paddingBottom:36,backgroundColor:'#EAF3F8',gap:12},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:6,marginTop:8},
  eyebrow:{fontSize:11,fontWeight:'700',letterSpacing:1.6,color:'#47728A'},
  title:{fontSize:23,fontWeight:'800',color:'#123449',marginTop:4},
  subtitle:{fontSize:13,color:'#567184',marginTop:4},
  voiceButton:{backgroundColor:'#fff',borderRadius:24,width:46,height:46,alignItems:'center',justifyContent:'center'},
  voiceText:{fontSize:22},
  stats:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:9},
  stat:{fontSize:13,color:'#3D6679'},
  statBold:{fontWeight:'800',color:'#153F56'},
  progressStrip:{flexDirection:'row',justifyContent:'space-around',backgroundColor:'#fff',paddingVertical:11,borderRadius:12},
  progressText:{fontSize:12,color:'#4E7285'},
  progressValue:{fontWeight:'800',color:'#184A66'},
  scoreText:{fontSize:17,color:'#22885A',fontWeight:'800',paddingTop:5},
  warning:{fontSize:12,textAlign:'center',color:'#A63C35'},
  smallCountryTitle:{fontSize:10,color:'#315C70',fontWeight:'800',letterSpacing:1,marginTop:12},
  microstateChips:{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'center',paddingHorizontal:8,paddingVertical:10},
  microstateChip:{backgroundColor:'#F8FCFF',borderRadius:10,borderWidth:1,borderColor:'#92B4C6',minHeight:38,paddingHorizontal:10,justifyContent:'center'},
  microstateChipText:{fontSize:12,color:'#1B4A63',fontWeight:'700'},
  mapModeRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  mapModeText:{fontSize:12,color:'#47728A'},
  namesButton:{backgroundColor:'#fff',borderRadius:10,paddingHorizontal:14,minHeight:44,justifyContent:'center'},
  namesButtonText:{color:'#1C567B',fontWeight:'700',fontSize:13},
  mapCard:{borderRadius:18,backgroundColor:SEA,overflow:'hidden',alignItems:'center',paddingTop:8,paddingBottom:6},
  controls:{flexDirection:'row',gap:6,alignItems:'center',marginTop:6,flexWrap:'wrap',justifyContent:'center'},
  control:{width:35,height:34,borderRadius:10,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  controlText:{fontSize:20,color:'#29536C',fontWeight:'600'},
  zoomLabel:{fontSize:12,color:'#29536C',minWidth:30,textAlign:'center'},
  feedback:{borderRadius:18,backgroundColor:'#fff',padding:16,gap:4},
  feedbackLabel:{fontSize:11,fontWeight:'800',letterSpacing:1.2,color:'#5A7C8A'},
  feedbackTitle:{fontSize:20,fontWeight:'700',color:'#163D53'},
  feedbackDescription:{fontSize:13,color:'#5F7B88'},
  replay:{fontSize:14,color:'#1771AD',fontWeight:'700',paddingVertical:8},
  legend:{flexDirection:'row',gap:8,flexWrap:'wrap',justifyContent:'center'},
  legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  legendSwatch:{width:11,height:11,borderRadius:3},
  legendText:{fontSize:10,color:'#3E5C6B'},
  nextButton:{borderRadius:14,backgroundColor:'#1C567B',padding:15,alignItems:'center'},
  nextText:{color:'#fff',fontWeight:'800',fontSize:15},
  footer:{fontSize:11,textAlign:'center',color:'#7592A0'},
});
