import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGE_OPTIONS } from '../ui/i18n';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { gameCopy } from '../features/geography/copy';
import { useMusic } from '../features/music/MusicContext';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import licenses from '../features/geography/data/licenses.json';

export function SettingsScreen() {
  const { mapId } = useMap();
  const isFocused = useIsFocused();
  const { language, setLanguage, languageError, retryLanguage } = useLanguage();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const { progress, status, update } = useProgress();
  const music = useMusic();
  const { setPreview } = music;
  useEffect(() => { if (!isFocused) setPreview(false); }, [isFocused, setPreview]);
  const musicCopy = { en: { title: 'Background music', hint: 'Original regional themes · offline. Off by default.', volume: 'Volume', error: 'Music preferences could not be saved.', retry: 'Retry', preview: 'Test music', stopPreview: 'Stop preview', loadingTrack: 'Loading music…', effects: 'Quiz sound effects', effectsHint: 'Soft sounds for correct answers and first-try completions. Off by default.', playbackError: 'Music cannot be played on this device.' }, pl: { title: 'Muzyka w tle', hint: 'Oryginalne motywy regionalne · offline. Domyślnie wyłączone.', volume: 'Głośność', error: 'Nie udało się zapisać ustawień muzyki.', retry: 'Ponów', preview: 'Testuj muzykę', stopPreview: 'Zatrzymaj podgląd', loadingTrack: 'Ładowanie muzyki…', effects: 'Dźwięki w quizach', effectsHint: 'Delikatne dźwięki za poprawne odpowiedzi i ukończenie za pierwszym razem. Domyślnie wyłączone.', playbackError: 'Nie można odtworzyć muzyki na tym urządzeniu.' }, ru: { title: 'Фоновая музыка', hint: 'Оригинальные региональные темы · офлайн. По умолчанию выключены.', volume: 'Громкость', error: 'Не удалось сохранить настройки музыки.', retry: 'Повторить', preview: 'Проверить музыку', stopPreview: 'Остановить', loadingTrack: 'Загрузка музыки…', effects: 'Звуки викторины', effectsHint: 'Тихие сигналы за правильные ответы и прохождение с первой попытки. По умолчанию выключены.', playbackError: 'Невозможно воспроизвести музыку на этом устройстве.' } }[language];
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
        <Text style={styles.hint}>{mapName(mapId, language)}</Text>
        <Text style={styles.text}>{musicCopy.volume}: {music.volume}%</Text>
        <View style={styles.volumeRow}>{[0, 10, 20, 30].map(value =>
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: music.volume === value, disabled: !music.loaded || music.error }} disabled={!music.loaded || music.error}
            onPress={() => music.update({ volume: value })} style={[styles.volumeButton, { backgroundColor: music.volume === value ? theme.brandDark : theme.paper }]}>
            <Text style={{ color: music.volume === value ? '#FFF' : theme.navy, fontWeight: '700' }}>{value}%</Text>
          </Pressable>)}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={music.preview ? musicCopy.stopPreview : musicCopy.preview}
          disabled={!music.trackReady || !!music.playbackError} onPress={() => music.setPreview(!music.preview)}
          style={styles.row}>
          <Text style={styles.link}>{music.preview ? musicCopy.stopPreview : musicCopy.preview}</Text>
          <Ionicons name={music.preview ? 'stop-circle-outline' : 'play-circle-outline'} size={24} color={theme.brand} />
        </Pressable>
        {!music.trackReady && !music.playbackError && <Text style={styles.hint}>{musicCopy.loadingTrack}</Text>}
        {!!music.playbackError && <Text accessibilityRole="alert" style={styles.error}>{musicCopy.playbackError}: {music.playbackError}</Text>}
        {music.error && <View accessibilityRole="alert"><Text style={styles.error}>{musicCopy.error}</Text>
          <Pressable accessibilityRole="button" onPress={music.retry} style={styles.row}><Text style={styles.link}>{musicCopy.retry}</Text></Pressable></View>}
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>{musicCopy.effects}</Text>
          <Switch accessibilityLabel={musicCopy.effects} value={music.effectsEnabled} disabled={!music.loaded || music.error}
            onValueChange={value => music.update({ effectsEnabled: value })} />
        </View>
        <Text style={styles.hint}>{musicCopy.effectsHint}</Text>
      </View>
      <ProgressStatus language={language} />
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
  title: { color: theme.navy, fontSize: 28, fontWeight: '800' }, card: { backgroundColor: theme.surface, borderRadius: 18, padding: 16, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.navy, flexShrink: 1 }, text: { fontSize: 14, color: theme.navy }, hint: { fontSize: 12, color: theme.muted, lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, gap: 10 }, link: { color: theme.brand, fontSize: 14, fontWeight: '700' }, error: { color: '#823C19', fontSize: 12 },
  volumeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, volumeButton: { minWidth: 57, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  historyRow: { paddingVertical: 8, gap: 4 }, modalHeader: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center' }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
