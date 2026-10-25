import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GeographyGameScreen } from './GeographyGameScreen';
import { difficultyPack } from '../features/geography/difficulty';
import { useProgress } from '../features/geography/ProgressContext';
import { countryName } from '../features/geography/countryFacts';
import { challengeQuestions, challengeSummary, type ChallengeAnswer } from '../features/geography/quickChallenge';
import { useLanguage } from '../ui/LanguageContext';
import { gameCopy } from '../features/geography/copy';
import { worldMapsTheme as theme } from '../ui/worldMapsTheme';

export function QuickChallengeScreen({ onBack }: { onBack: () => void }) {
  const { progress } = useProgress();
  const { language } = useLanguage();
  const c = gameCopy[language];
  const pack = useMemo(() => difficultyPack(progress.difficulty), [progress.difficulty]);
  const [questions, setQuestions] = useState(() => challengeQuestions(pack));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ChallengeAnswer[]>([]);
  const question = questions[index];
  const finished = index >= questions.length;
  const result = challengeSummary(answers, questions.length);
  const answer = (correct: boolean, targetId: string) =>
    setAnswers(current => current.length !== index ? current : [...current, { correct, targetId }]);
  const next = () => { if (answers.length > index) setIndex(value => value + 1); };
  if (!finished && question) {
    return <GeographyGameScreen key={index} mode={question.mode} onBack={onBack}
      findClue={question.findClue} nameAnswer={question.nameAnswer}
      challenge={{ targetId: question.targetId, index, total: questions.length, onAnswer: answer, onNext: next }} />;
  }
  return <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.content}>
      <Ionicons name="trophy-outline" size={54} color={theme.brand} />
      <Text style={styles.heading}>{c.quickResults}</Text>
      <Text style={styles.score}>{result.correct}/{result.total}</Text>
      <Text style={styles.subtitle}>{c.quickAccuracy}: {result.accuracy}%</Text>
      <View style={styles.review}>
        <Text style={styles.reviewHeading}>{c.quickToReview}</Text>
        {result.reviewIds.length ? result.reviewIds.map(id =>
          <Text key={id} style={styles.reviewItem}>• {countryName(id, language)}</Text>)
          : <Text style={styles.reviewItem}>{c.quickCorrect}</Text>}
      </View>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
        setQuestions(challengeQuestions(pack)); setIndex(0); setAnswers([]);
      }}><Text style={styles.buttonText}>{c.quickAgain}</Text></Pressable>
      <Pressable accessibilityRole="button" style={styles.outline} onPress={onBack}>
        <Text style={styles.outlineText}>{c.quickDone}</Text>
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  content: { flexGrow: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  heading: { fontSize: 25, fontWeight: '800', color: theme.navy },
  score: { fontSize: 56, fontWeight: '900', color: theme.brand },
  subtitle: { fontSize: 18, color: theme.muted },
  review: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, alignSelf: 'stretch', gap: 8 },
  reviewHeading: { fontSize: 16, fontWeight: '800', color: theme.navy },
  reviewItem: { fontSize: 14, color: theme.muted },
  button: { width: '100%', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: theme.brand },
  buttonText: { color: '#FFF', fontWeight: '800' },
  outline: { width: '100%', alignItems: 'center', padding: 16 },
  outlineText: { color: theme.brand, fontWeight: '700' },
});
