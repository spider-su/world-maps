import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } useColorScheme } from 'react-native';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { gameCopy } from './copy';
import type { Language } from '../../ui/i18n';
import { MODE_DEFINITIONS, type FindClue, type GameMode, type NameAnswer } from './modes';

interface Props {
  value?: GameMode;
  language?: Language;
  onChange: (mode: GameMode) => void;
  findClue?: FindClue;
  onFindClue?: (value: FindClue) => void;
  nameAnswer?: NameAnswer;
  onNameAnswer?: (value: NameAnswer) => void;
}

/** Reusable country/city game-mode cards; no game state is stored here. */
export function ModeSelector({ value, onChange, language = 'en', findClue = 'mixed', onFindClue, nameAnswer = 'country', onNameAnswer }: Props) {
  const c = gameCopy[language];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>{c.chooseMode.toUpperCase()}</Text>
      <View style={styles.container}>
        {MODE_DEFINITIONS.map(item => {
          const colors = theme.mode[item.id];
          const selected = item.id === value;
          return (
            <Pressable key={item.id} accessibilityRole="button"
              accessibilityLabel={`${c.modes[item.id].title}. ${c.modes[item.id].description}`}
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.selected]}
              onPress={() => onChange(item.id)}>
              <View style={[styles.iconTile, { backgroundColor: selected ? theme.surface : colors.tint }]}>
                <Ionicons name={colors.icon} size={23} color={colors.foreground} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, selected && styles.selectedLabel]}>{c.modes[item.id].title}</Text>
                <Text style={[styles.description, selected && styles.selectedDescription]} numberOfLines={2}>{c.modes[item.id].description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={selected ? theme.surface : theme.muted} />
            </Pressable>
          );
        })}
      </View>
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
    </View>
  );
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  variants: { gap: 6, marginTop: 4 },
  variantLabel: { fontSize: 12, fontWeight: '700', color: theme.muted },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  variant: { minHeight: 38, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, backgroundColor: theme.ocean },
  variantSelected: { backgroundColor: theme.brandDark },
  variantText: { color: theme.brandDark, fontWeight: '700', fontSize: 12 },
  variantSelectedText: { color: '#FFF' },
  wrapper: { gap: 8 },
  header: { fontSize: 11, fontWeight: '800', color: theme.muted, letterSpacing: 1.3, marginLeft: 4 },
  container: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 66, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
  },
  selected: { backgroundColor: theme.brandDark, borderColor: theme.brandDark },
  iconTile: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  label: { fontSize: 15, fontWeight: '800', color: theme.navy },
  selectedLabel: { color: theme.surface },
  description: { fontSize: 11, color: theme.muted },
  selectedDescription: { color: '#D6E8F7' },
});
