import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { countryWikipedia, type CountryPhoto } from './countryPhotos';

import { galleryCopy } from './galleryCopy';

function Photo({ photo, language, open }: { photo: CountryPhoto; language: Language; open: (url: string) => void }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const theme = themeForScheme(useColorScheme());
  const c = galleryCopy[language];
  return <View style={[styles.photoCard, { backgroundColor: theme.paper, borderColor: theme.border }]}>
    <View style={styles.imageFrame}>
      {state !== 'failed' && <Image key={attempt} source={{ uri: photo.url, headers: { 'User-Agent': 'WorldMaps/0.1 (https://github.com/spider-su/world-maps)' } }} resizeMode="contain" style={styles.image}
        accessibilityLabel={photo.caption} onLoad={() => setState('loaded')} onError={() => setState('failed')} />}
      {state === 'loading' && <ActivityIndicator accessibilityLabel={c.loading} style={StyleSheet.absoluteFill} color={theme.brand} />}
      {state === 'failed' && <View style={styles.failure}><Text style={{ color: theme.muted }}>{c.unavailable}</Text><Pressable accessibilityRole="button" style={styles.action} onPress={() => { setState('loading'); setAttempt(a => a + 1); }}><Text style={{ color: theme.brand }}>{c.retry}</Text></Pressable></View>}
    </View>
    <Text numberOfLines={2} style={[styles.caption, { color: theme.navy }]}>{photo.caption}</Text>
    <Text numberOfLines={2} style={[styles.credit, { color: theme.muted }]}>{photo.credit}</Text>
    <View style={styles.links}>
      <Pressable accessibilityRole="link" accessibilityLabel={`${c.source}: ${photo.credit}`} style={styles.action} onPress={() => open(photo.source)}><Text style={{ color: theme.brand }}>{c.source}</Text></Pressable>
      <Pressable accessibilityRole="link" style={styles.action} onPress={() => open(photo.licenseUrl || photo.source)}><Text style={{ color: theme.brand }}>{photo.license}</Text></Pressable>
    </View>
  </View>;
}

/** Separate from quiz prompts; mounted only in the expanded Learn/collection details. */
export function CountryGallery({ id, language }: { id: string; language: Language }) {
  const entry = countryWikipedia[id];
  const [expanded, setExpanded] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);
  const theme = themeForScheme(useColorScheme());
  const c = galleryCopy[language];
  if (!entry) return null;
  const open = (url: string) => { setLinkFailed(false); void Linking.openURL(url).catch(() => setLinkFailed(true)); };
  return <View style={styles.section}>
    <Pressable accessibilityRole="link" style={styles.action} onPress={() => open(entry.article)}>
      <Ionicons name="open-outline" size={18} color={theme.brand} /><Text style={{ color: theme.brand, flexShrink: 1 }}>{c.article}</Text>
    </Pressable>
    {!!entry.photos.length && <>
      <View style={styles.heading}><Text accessibilityRole="header" style={[styles.title, { color: theme.navy }]}>{c.photos} · {c.online}</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} style={styles.action} onPress={() => setExpanded(v => !v)}><Text style={{ color: theme.brand }}>{expanded ? c.hide : c.show}</Text></Pressable>
      </View>
      {expanded && <ScrollView horizontal contentContainerStyle={styles.gallery}>
        {entry.photos.map(photo => <Photo key={photo.source} photo={photo} language={language} open={open} />)}
      </ScrollView>}
    </>}
    {linkFailed && <Text accessibilityRole="alert" style={{ color: theme.muted }}>{c.linkError}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: 8 }, action: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 4 },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 }, title: { fontWeight: '700', fontSize: 14 },
  gallery: { gap: 12, paddingBottom: 10 }, photoCard: { width: 258, borderRadius: 14, borderWidth: 1, overflow: 'hidden', padding: 8, gap: 5 },
  imageFrame: { height: 164, justifyContent: 'center' }, image: { width: '100%', height: '100%' }, failure: { padding: 8 },
  caption: { fontSize: 12, fontWeight: '600' }, credit: { fontSize: 11 }, links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
