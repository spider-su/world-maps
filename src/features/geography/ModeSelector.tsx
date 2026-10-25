import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { worldMapsTheme as theme } from '../../ui/worldMapsTheme';
import { gameCopy } from './copy';
import type { Language } from '../../ui/i18n';
import { GAME_MODES, type GameMode } from './modes';

interface Props {
  value?: GameMode;
  language?: Language;
  onChange: (mode: GameMode) => void;
}

/** Reusable country/city game-mode cards; no game state is stored here. */
export function ModeSelector({ value, onChange, language = 'en' }: Props) {
  const c = gameCopy[language];
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>{c.chooseMode.toUpperCase()}</Text>
      <View style={styles.container}>
        {GAME_MODES.map(id => {
          const colors = theme.mode[id];
          const selected = id === value;
          return (
            <Pressable key={id} accessibilityRole="button"
              accessibilityLabel={`${c.modes[id].title}. ${c.modes[id].description}`}
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.selected]}
              onPress={() => onChange(id)}>
              <View style={[styles.iconTile, { backgroundColor: selected ? theme.surface : colors.tint }]}>
                <Ionicons name={colors.icon} size={23} color={colors.foreground} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, selected && styles.selectedLabel]}>{c.modes[id].title}</Text>
                <Text style={[styles.description, selected && styles.selectedDescription]} numberOfLines={2}>{c.modes[id].description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={selected ? theme.surface : theme.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  header: { fontSize: 11, fontWeight: '800', color: theme.muted, letterSpacing: 1.3, marginLeft: 4 },
  container: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 66, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderColor: '#DFE8F3',
  },
  selected: { backgroundColor: theme.brandDark, borderColor: theme.brandDark },
  iconTile: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 3 },
  label: { fontSize: 15, fontWeight: '800', color: theme.navy },
  selectedLabel: { color: theme.surface },
  description: { fontSize: 11, color: theme.muted },
  selectedDescription: { color: '#D6E8F7' },
});
