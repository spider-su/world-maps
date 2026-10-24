import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { europePack, europeShapes } from '../features/geography/europe';
import { europeBorderDistanceKm } from '../features/geography/borderDistance';
import { microstates } from '../features/geography/microstates';
import { distanceKm } from '../features/geography/engine';
import { frame, INITIAL_VIEWPORT, normalize, pan, zoomAt, type Viewport } from '../features/geography/viewport';
import { guess, startRound, type GuessResult, type Round } from '../features/geography/engine';

const SEA = '#B7DEEF';
const NEUTRAL = '#F0F3F1';
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
  const [round, setRound] = useState<Round>(() => startRound(europePack));
  const [feedback, setFeedback] = useState<{ name: string; result: GuessResult } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const gestureRef = useRef({ viewport, pinchDistance: 0 });
  const completed = round.completedAt !== undefined;
  const spokenLanguage = 'en-US';

  const visible = useMemo(() => frame(viewport), [viewport]);
  const zoom = viewport.zoom;

  const restart = () => {
    void Speech.stop().catch(() => undefined);
    setRound(startRound(europePack));
    setFeedback(null);
  };

  useEffect(() => () => { void Speech.stop().catch(() => undefined); }, []);

  const distanceResolver = useCallback((a: (typeof europePack.locations)[number], b: (typeof europePack.locations)[number]) => (
    microstates.some(state => state.id === a.id || state.id === b.id)
      ? distanceKm(a, b)
      : europeBorderDistanceKm(a, b)
  ), []);

  const selectCountry = useCallback((id: string) => {
    try {
      const picked = guess(europePack, round, id, distanceResolver);
      setRound(picked.round);
      setFeedback({ name: picked.location.name, result: picked.result });
      if (soundEnabled) {
        void Speech.stop()
          .catch(() => undefined)
          .then(() => Speech.speak(picked.location.name, { language: spokenLanguage, rate: 0.9 }));
      }
    } catch {
      // A completed round cannot accept new guesses; the player starts the next round.
    }
  }, [round, soundEnabled, distanceResolver]);

  const resultById = useMemo(() => {
    const target = europePack.locations.find(item => item.id === round.targetId);
    const results = new Map<string, GuessResult>();
    if (target) {
      for (const id of round.guesses) {
        const location = europePack.locations.find(item => item.id === id);
        if (location) {
          const result = guess(europePack, { ...round, guesses: [], completedAt: undefined }, id, distanceResolver);
          results.set(id, result.result);
        }
      }
    }
    return results;
  }, [round, distanceResolver]);

  const mapWidth = Math.max(280, Math.min(width - 24, 680));
  const mapHeight = mapWidth * 570 / 864;
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (event, gesture) =>
      event.nativeEvent.touches.length > 1 || Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
    onPanResponderGrant: () => {
      gestureRef.current = { viewport: viewportRef.current, pinchDistance: 0 };
    },
    onPanResponderMove: (event, gesture) => {
      const touches = event.nativeEvent.touches;
      if (touches.length >= 2 && touches[0] && touches[1]) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.hypot(dx, dy);
        if (!gestureRef.current.pinchDistance) {
          gestureRef.current = { viewport: viewportRef.current, pinchDistance: distance };
          return;
        }
        const factor = distance / gestureRef.current.pinchDistance;
        setViewport(zoomAt(gestureRef.current.viewport, factor, { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));
      } else if (gestureRef.current.pinchDistance) {
        gestureRef.current = { viewport: viewportRef.current, pinchDistance: 0, startZoom: viewportRef.current.zoom };
      } else {
        setViewport(pan(gestureRef.current.viewport, gesture.dx, gesture.dy, mapWidth));
      }
    },
    onPanResponderRelease: () => { gestureRef.current.pinchDistance = 0; },
    onPanResponderTerminate: () => { gestureRef.current.pinchDistance = 0; },
  }), [mapWidth, mapHeight]);

  const adjustZoom = (factor: number) => setViewport(old =>
    zoomAt(old, factor, { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>EUROPE · HOT & COLD</Text>
          <Text style={styles.title}>{completed ? 'Country found!' : 'Find the hidden country'}</Text>
          <Text style={styles.subtitle}>{completed ? 'Great work. Ready for another?' : 'Tap a country to reveal a distance clue.'}</Text>
        </View>
        <Pressable style={styles.voiceButton} onPress={() => setSoundEnabled(value => !value)} accessibilityRole="button" accessibilityLabel={soundEnabled ? 'Mute voice' : 'Enable voice'}>
          <Text style={styles.voiceText}>{soundEnabled ? '🔊' : '🔇'}</Text>
        </Pressable>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>Guesses  <Text style={styles.statBold}>{round.guesses.length}</Text></Text>
        <Text style={styles.stat}>{completed ? 'Solved ✓' : 'Target hidden ?'}</Text>
      </View>
      <View style={styles.mapCard}>
        <View {...responder.panHandlers} collapsable={false}>
        <Svg width={mapWidth} height={mapHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityLabel="Interactive map of Europe. Tap countries to guess.">
          <Rect width="864" height="570" fill={SEA} />
          {europeShapes.map(shape => (
            <Path key={shape.id} d={shape.path}
              fill={resultById.has(shape.id) ? COLORS[resultById.get(shape.id)!] : NEUTRAL}
              stroke="#46677B" strokeWidth={Math.max(0.8, 1.5 / zoom)} strokeLinejoin="round"
              onPress={() => selectCountry(shape.id)}
            />
          ))}
          {microstates.map(state => {
            const result = resultById.get(state.id);
            return <Circle key={state.id} cx={state.x} cy={state.y}
              r={Math.max(2, 5 / zoom)}
              fill={result ? COLORS[result] : '#F9FAFB'} stroke="#17364A"
              strokeWidth={Math.max(0.7, 1.5 / zoom)} onPress={() => selectCountry(state.id)} />;
          })}
          {microstates.map(state => <Circle key={`${state.id}-hit`} cx={state.x} cy={state.y}
            r={Math.max(5, 14 / zoom)} fill="transparent"
            onPress={() => selectCountry(state.id)} />)}
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
      </View>
      <View style={styles.feedback}>
        <Text style={styles.feedbackLabel}>{feedback ? 'YOUR LAST GUESS' : 'HOW TO PLAY'}</Text>
        <Text style={styles.feedbackTitle}>{feedback ? feedback.name : 'Discover a country'}</Text>
        <Text style={styles.feedbackDescription}>{feedback ? LABELS[feedback.result] : 'Each guess is colored based on proximity. Names are only revealed after you tap.'}</Text>
        {feedback && <Pressable accessibilityRole="button" onPress={() => {
          void Speech.stop().catch(() => undefined).then(() => Speech.speak(feedback.name, { language: spokenLanguage, rate: 0.9 }));
        }}><Text style={styles.replay}>▶ Hear name again</Text></Pressable>}
      </View>
      <View style={styles.legend}>
        {(['very-far','far','close','very-close','correct'] as const).map(key =>
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, {backgroundColor:COLORS[key]}]} />
            <Text style={styles.legendText}>{LABELS[key]}</Text>
          </View>
        )}
      </View>
      <Pressable style={styles.nextButton} onPress={restart} accessibilityRole="button">
        <Text style={styles.nextText}>{completed ? 'Next country →' : 'New hidden country ↻'}</Text>
      </Pressable>
      <Text style={styles.footer}>Pinch to zoom · drag to move · tap the microstate dots</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  mapCard:{borderRadius:18,backgroundColor:'#B7DEEF',overflow:'hidden',alignItems:'center',paddingTop:8,paddingBottom:6},
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
