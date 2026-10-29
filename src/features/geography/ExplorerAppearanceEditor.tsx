import { Pressable, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../ui/LanguageContext';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { ExplorerAvatar } from './ExplorerAvatar';
import { explorerColors, HAIR_COLORS, EYE_COLORS, type ExplorerAppearance, type ExplorerId } from './explorer';

export const appearanceCopy = {
  en: { preview: 'Your character', hair: 'Hair colour', eyes: 'Eye colour', original: 'Original', brown: 'Brown', blond: 'Blond', red: 'Red', blue: 'Blue', green: 'Green' },
  pl: { preview: 'Twoja postać', hair: 'Kolor włosów', eyes: 'Kolor oczu', original: 'Oryginalny', brown: 'Brązowy', blond: 'Blond', red: 'Rudy', blue: 'Niebieski', green: 'Zielony' },
  ru: { preview: 'Твой персонаж', hair: 'Цвет волос', eyes: 'Цвет глаз', original: 'Исходный', brown: 'Коричневый', blond: 'Блонд', red: 'Рыжий', blue: 'Синий', green: 'Зелёный' },
};

/** Two small cosmetic controls; the caller owns serialized persistence. */
export function ExplorerAppearanceEditor({ explorer, appearance, stage, onChange }: {
  explorer: ExplorerId; appearance?: ExplorerAppearance; stage: number;
  onChange: (next: Partial<ExplorerAppearance>) => void;
}) {
  const { language } = useLanguage();
  const c = appearanceCopy[language];
  const theme = themeForScheme(useColorScheme());
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale > 1.3;
  const original = explorerColors(explorer);
  return <View style={{ gap: 14 }}>
    <View style={{ alignItems: 'center' }}><ExplorerAvatar explorer={explorer} appearance={appearance} stage={stage} size={128} label={c.preview} /></View>
    {(['hair', 'eyes'] as const).map(part => {
      const colors = part === 'hair' ? HAIR_COLORS : EYE_COLORS;
      const options = [{ id: undefined, label: c.original, color: original[part] },
        ...Object.entries(colors).map(([id, color]) => ({ id, label: c[id as keyof typeof colors], color }))];
      return <View key={part} style={{ gap: 8 }}>
        <Text style={{ color: theme.navy, fontSize: 15, fontWeight: '700' }}>{c[part]}</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel={c[part]} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {options.map(option => {
            const selected = appearance?.[part] === option.id;
            return <Pressable key={option.id ?? 'original'} accessibilityRole="radio" accessibilityLabel={option.label}
              aria-checked={selected} accessibilityState={{ checked: selected }} onPress={() => onChange({ [part]: option.id })}
              style={{ flexBasis: compact ? '40%' : '22%', flexGrow: 1, minWidth: 72, minHeight: 64, padding: 6, gap: 6, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderRadius: 12, borderColor: selected ? theme.brand : theme.border, backgroundColor: theme.paper }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: option.color, alignItems: 'center', justifyContent: 'center' }}>
                {selected && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </View>
              <Text style={{ color: theme.navy, fontSize: 11, textAlign: 'center', flexShrink: 1 }}>{option.label}</Text>
            </Pressable>;
          })}
        </View>
      </View>;
    })}
  </View>;
}
