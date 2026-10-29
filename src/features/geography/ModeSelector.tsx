import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { gameCopy } from './copy';
import type { Language } from '../../ui/i18n';
import { GAME_MODES, type FindClue, type GameMode, type NameAnswer } from './modes';

interface Props {
  value?: GameMode;
  disabled?: boolean;
  language?: Language;
  onChange: (mode: GameMode) => void;
  findClue?: FindClue;
  onFindClue?: (value: FindClue) => void;
  nameAnswer?: NameAnswer;
  onNameAnswer?: (value: NameAnswer) => void;
}

/** Reusable country/city game-mode cards; no game state is stored here. */
export function ModeSelector({ value, onChange, disabled = false, language = 'en', findClue = 'mixed', onFindClue, nameAnswer = 'country', onNameAnswer }: Props) {
  const c = gameCopy[language];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {GAME_MODES.map(id => {
          const colors = theme.mode[id];
          const accent = { 'hot-cold': '#F05260', 'find-it': '#2176FF', 'name-it': '#F2A000', learn: '#20BB70' }[id];
          const selected = id === value;
          return (
            <Pressable key={id} accessibilityRole="button"
              disabled={disabled} accessibilityLabel={`${c.modes[id].title}. ${c.modes[id].description}. ${id === 'find-it' ? c.findClues[findClue] : id === 'name-it' ? c.nameAnswers[nameAnswer] : ''}`}
              accessibilityState={{ selected, disabled }}
              style={[styles.option, selected && styles.selected]}
              onPress={() => onChange(id)}>
              <View style={[styles.iconTile, { backgroundColor: accent }]}>
                <Ionicons name={colors.icon} size={23} color="#FFFFFF" />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, selected && styles.selectedLabel]}>{c.modes[id].title}</Text>
                <Text style={[styles.description, selected && styles.selectedDescription]}>{c.modeCaptions[id]}{id === 'find-it' ? ` · ${c.findClues[findClue]}` : id === 'name-it' ? ` · ${c.nameAnswers[nameAnswer]}` : ''}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {(onFindClue || onNameAnswer) && <QuizOptions language={language} findClue={findClue} onFindClue={onFindClue} nameAnswer={nameAnswer} onNameAnswer={onNameAnswer} />}
    </View>
  );
}
/** The existing clue/answer choices, shown in Home's play-options sheet. */
export function QuizOptions({ language = 'en', findClue = 'mixed', onFindClue, nameAnswer = 'country', onNameAnswer }: Pick<Props, 'language' | 'findClue' | 'onFindClue' | 'nameAnswer' | 'onNameAnswer'>) {
  const c = gameCopy[language];
  const styles = makeStyles(themeForScheme(useColorScheme()));
  return <View style={styles.wrapper}>
      {onFindClue && <View style={styles.variants}>
        <Text style={styles.variantLabel}>{c.clueType}</Text>
        <View style={styles.variantRow}>
          {(['name', 'capital', 'flag', 'mixed'] as const).map(clue => (
            <Pressable key={clue} accessibilityRole="button" accessibilityState={{ selected: findClue === clue }}
              style={[styles.variant, findClue === clue && styles.variantSelected]} onPress={() => onFindClue(clue)}>
              <Text style={[styles.variantText, findClue === clue && styles.variantSelectedText]}>{c.findClues[clue]}</Text>
            </Pressable>
          ))}
        </View>
      </View>}
      {onNameAnswer && <View style={styles.variants}>
        <Text style={styles.variantLabel}>{c.answerType}</Text>
        <View style={styles.variantRow}>
          {(['country', 'capital'] as const).map(answer => (
            <Pressable key={answer} accessibilityRole="button" accessibilityState={{ selected: nameAnswer === answer }}
              style={[styles.variant, nameAnswer === answer && styles.variantSelected]} onPress={() => onNameAnswer(answer)}>
              <Text style={[styles.variantText, nameAnswer === answer && styles.variantSelectedText]}>{c.nameAnswers[answer]}</Text>
            </Pressable>
          ))}
        </View>
      </View>}
  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  variants: { gap: 6, marginTop: 4 },
  variantLabel: { fontSize: 12, fontWeight: '700', color: theme.muted },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  variant: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, backgroundColor: theme.ocean },
  variantSelected: { backgroundColor: theme.brandDark },
  variantText: { color: theme.brandDark, fontWeight: '700', fontSize: 12 },
  variantSelectedText: { color: '#FFF' },
  wrapper: { gap: 8 },
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    flexDirection: 'column', alignItems: 'flex-start', gap: 10, flexGrow: 1, flexBasis: '46%',
    minHeight: 140, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.surface,
  },
  selected: { backgroundColor: theme.brandDark, borderColor: theme.brandDark },
  iconTile: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  label: { fontSize: 16, fontWeight: '800', color: theme.navy },
  selectedLabel: { color: theme.surface },
  description: { fontSize: 12, lineHeight: 17, color: theme.muted },
  selectedDescription: { color: '#D6E8F7' },
});
