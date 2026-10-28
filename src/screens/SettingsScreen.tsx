import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGE_OPTIONS } from '../ui/i18n';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { gameCopy } from '../features/geography/copy';
import { useMusic } from '../features/music/MusicContext';
import { useProgress } from '../features/geography/ProgressContext';
import { LearningOverview } from '../features/geography/LearningOverview';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { summary } from '../features/geography/progress';
import { useMap } from '../features/geography/MapContext';
import { modePackId } from '../features/geography/modes';
import licenses from '../features/geography/data/licenses.json';

export function SettingsScreen() {
  const { map } = useMap();
  const isFocused = useIsFocused();
  const { language, setLanguage, languageError, retryLanguage } = useLanguage();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const { progress, status, update } = useProgress();
  const music = useMusic();
  const musicCopy = { en: { title: 'Background music', hint: 'Original Europe Learn theme · offline. Off by default.', volume: 'Volume', error: 'Music preferences could not be saved.', retry: 'Retry' }, pl: { title: 'Muzyka w tle', hint: 'Oryginalny motyw nauki Europy · offline. Domyślnie wyłączony.', volume: 'Głośność', error: 'Nie udało się zapisać ustawień muzyki.', retry: 'Ponów' }, ru: { title: 'Фоновая музыка', hint: 'Оригинальная тема изучения Европы · офлайн. По умолчанию выключена.', volume: 'Громкость', error: 'Не удалось сохранить настройки музыки.', retry: 'Повторить' } }[language];
  const [showLicenses, setShowLicenses] = useState(false);
  const c = gameCopy[language];
  return <SafeAreaView edges={['top']} style={styles.screen}>
    {isFocused && <StatusBar style="auto" />}
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.title}>{c.settings}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{c.language}</Text>
        {LANGUAGE_OPTIONS.map(({ id: value, label }) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: language === value }}
          style={styles.row} onPress={() => setLanguage(value)}>
          <Text style={styles.text}>{label}</Text>
          <Ionicons name={language === value ? 'radio-button-on' : 'radio-button-off'} size={22} color={theme.brand} />
        </Pressable>)}
        {languageError && <View accessibilityRole="alert"><Text style={styles.error}>{c.languageError}</Text>
          <Pressable accessibilityRole="button" style={styles.row} onPress={retryLanguage}><Text style={styles.link}>{c.retrySave}</Text></Pressable>
        </View>}
      </View>
      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.cardTitle}>{c.voice}</Text>
          <Switch accessibilityLabel={c.voice} value={progress.voiceEnabled} disabled={status === 'loading' || status === 'read-error'}
            onValueChange={value => { update(current => ({ ...current, voiceEnabled: value })); }} />
        </View><Text style={styles.hint}>{c.voiceHint}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.cardTitle}>{musicCopy.title}</Text>
          <Switch accessibilityLabel={musicCopy.title} value={music.enabled} disabled={!music.loaded || music.error} onValueChange={value => music.update({ enabled: value })} />
        </View>
        <Text style={styles.hint}>{musicCopy.hint}</Text>
        <Text style={styles.text}>{musicCopy.volume}: {music.volume}%</Text>
        <View style={styles.volumeRow}>{[0, 10, 20, 30].map(value =>
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: music.volume === value, disabled: !music.loaded || music.error }} disabled={!music.loaded || music.error}
            onPress={() => music.update({ volume: value })} style={[styles.volumeButton, { backgroundColor: music.volume === value ? theme.brandDark : theme.paper }]}>
            <Text style={{ color: music.volume === value ? '#FFF' : theme.navy, fontWeight: '700' }}>{value}%</Text>
          </Pressable>)}
        </View>
        {music.error && <View accessibilityRole="alert"><Text style={styles.error}>{musicCopy.error}</Text>
          <Pressable accessibilityRole="button" onPress={music.retry} style={styles.row}><Text style={styles.link}>{musicCopy.retry}</Text></Pressable></View>}
      </View>
      <ProgressStatus language={language} />
      <LearningOverview language={language} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{c.history}</Text>
        {status === 'loading' ? <Text style={styles.hint}>{c.loading}</Text> : (['hot-cold','find-it','name-it'] as const).map(mode => {
          const stats = summary(progress, modePackId(map.pack.id, mode));
          return <View key={mode} style={styles.historyRow}><Text style={styles.text}>{c.modes[mode].title}</Text>
            <Text style={styles.hint}>{c.solved}: {stats.played} · {c.best}: {stats.bestScore}</Text>
          </View>;
        })}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{c.about}</Text><Text style={styles.hint}>{c.privacy}</Text><Text style={styles.hint}>{c.mapSource}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={c.licenses} style={styles.row} onPress={() => setShowLicenses(true)}><Text style={styles.link}>{c.licenses}</Text><Ionicons name="chevron-forward" size={18} color={theme.brand} /></Pressable>
      </View>
    </ScrollView>
    <Modal visible={showLicenses} animationType="slide" onRequestClose={() => setShowLicenses(false)}>
      <SafeAreaView edges={['top','bottom']} style={styles.screen}>
        <View style={styles.modalHeader}><Text style={styles.cardTitle}>{c.licenses}</Text><Pressable accessibilityRole="button" accessibilityLabel={c.close} style={styles.close} onPress={() => setShowLicenses(false)}><Ionicons name="close" size={24} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.text}>Natural Earth · public domain{ '\n' }naturalearthdata.com</Text>
          <Text style={styles.text}>Country facts: mledoze/countries · ODbL 1.0{ '\n' }github.com/mledoze/countries</Text>
          <Text style={styles.hint}>{licenses.facts}</Text>
          <Text style={styles.text}>Flags: flag-icons · MIT{ '\n' }github.com/lipis/flag-icons</Text>
          <Text style={styles.hint}>{licenses.flags}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper }, body: { padding: 16, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 30 },
  title: { color: theme.navy, fontSize: 28, fontWeight: '800' }, card: { backgroundColor: theme.surface, borderRadius: 18, padding: 16, gap: 8, borderWidth: 1, borderColor: theme.border },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.navy, flexShrink: 1 }, text: { fontSize: 14, color: theme.navy }, hint: { fontSize: 12, color: theme.muted, lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 10 }, link: { color: theme.brand, fontSize: 14, fontWeight: '700' }, error: { color: '#823C19', fontSize: 12 },
  volumeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, volumeButton: { minWidth: 57, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  historyRow: { paddingVertical: 8, gap: 4 }, modalHeader: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center' }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
