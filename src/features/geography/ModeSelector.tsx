import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODE_DEFINITIONS, type GameMode } from './modes';

interface Props {
  value: GameMode;
  onChange: (mode: GameMode) => void;
}

/** Shared picker for all geography map packs. Does not own game state. */
export function ModeSelector({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.header}>CHOOSE A MODE</Text>
      <View style={styles.container}>
        {MODE_DEFINITIONS.map(item => (
          <Pressable key={item.id} accessibilityRole="button"
            accessibilityLabel={item.title} accessibilityState={{ selected: item.id === value }}
            style={[styles.option, item.id === value && styles.selected]}
            onPress={() => onChange(item.id)}>
            <Text style={[styles.label, item.id === value && styles.selectedLabel]}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { fontSize: 11, fontWeight: '800', color: '#47728A', letterSpacing: 1, marginLeft: 5, marginBottom: 6 },
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: { flexGrow: 1, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center' },
  selected: { backgroundColor: '#1C567B' },
  label: { fontSize: 13, fontWeight: '700', color: '#1C567B' },
  selectedLabel: { color: '#FFF' },
});
