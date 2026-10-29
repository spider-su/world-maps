import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { countryWikipedia, countryPhotoSource, type CountryPhoto } from './countryPhotos';

import { galleryCopy } from './galleryCopy';

function Photo({ photo, language, open, width }: { photo: CountryPhoto; language: Language; open: (url: string) => void; width: number }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const theme = themeForScheme(useColorScheme());
  const c = galleryCopy[language];
  return <View style={[styles.photoCard, { width, backgroundColor: theme.surface }]}>
    <View style={[styles.imageFrame, { height: Math.min(280, width * 2 / 3) }]}>
      {state !== 'failed' && <Image key={attempt} source={countryPhotoSource(photo.url, Platform.OS)} resizeMode="contain" style={styles.image}
        accessibilityLabel={photo.caption} onLoad={() => setState('loaded')} onError={() => setState('failed')} />}
      {state === 'loading' && <ActivityIndicator accessibilityLabel={c.loading} style={StyleSheet.absoluteFill} color={theme.brand} />}
      {state === 'failed' && <View style={styles.failure}><Text style={{ color: theme.muted }}>{c.unavailable}</Text><Pressable accessibilityRole="button" style={styles.action} onPress={() => { setState('loading'); setAttempt(a => a + 1); }}><Text style={{ color: theme.brand }}>{c.retry}</Text></Pressable></View>}
    </View>
    <Text numberOfLines={2} style={[styles.caption, { color: theme.navy }]}>{photo.caption}</Text>
    <Text style={[styles.credit, { color: theme.muted }]}>{photo.credit}</Text>
    <View style={styles.links}>
      <Pressable accessibilityRole="link" accessibilityLabel={`${c.source}: ${photo.credit}`} style={styles.action} onPress={() => open(photo.source)}><Text style={{ color: theme.brand }}>{c.source}</Text></Pressable>
      <Pressable accessibilityRole="link" style={styles.action} onPress={() => open(photo.licenseUrl || photo.source)}><Text style={{ color: theme.brand }}>{photo.license}</Text></Pressable>
    </View>
  </View>;
}

/** Separate from quiz prompts; mounted only in the expanded Learn/collection details. */
export function CountryGallery({ id, language }: { id: string; language: Language }) {
  const entry = countryWikipedia[id];
  const [width, setWidth] = useState(258);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);
  const theme = themeForScheme(useColorScheme());
  const c = galleryCopy[language];
  if (!entry) return null;
  const open = (url: string) => { setLinkFailed(false); void Linking.openURL(url).catch(() => setLinkFailed(true)); };
  return <View style={styles.section} onLayout={event => setWidth(Math.max(180, Math.min(440, event.nativeEvent.layout.width)))}>
    {!!entry.photos.length && <>
      <Pressable accessibilityRole="button" accessibilityLabel={expanded ? c.hide : `${c.show} · ${c.online}`} accessibilityState={{ expanded }} style={styles.action} onPress={() => { setExpanded(v => !v); setPhotoIndex(0); }}>
        <Ionicons name="images-outline" size={19} color={theme.brand} /><Text style={{ color: theme.brand, flexShrink: 1 }}>{expanded ? c.hide : c.show}</Text>{!expanded && <Text style={[styles.online, { color: theme.muted }]}>{c.online}</Text>}
      </Pressable>
      {expanded && <>
      <ScrollView horizontal onScroll={event => setPhotoIndex(Math.max(0, Math.min(entry.photos.length - 1, Math.round(event.nativeEvent.contentOffset.x / (width + 12)))))} scrollEventThrottle={64} showsHorizontalScrollIndicator={false} snapToInterval={width + 12} decelerationRate="fast" contentContainerStyle={styles.gallery}>
        {entry.photos.map(photo => <Photo width={width} key={photo.source} photo={photo} language={language} open={open} />)}
      </ScrollView>
      {entry.photos.length > 1 && <View accessible accessibilityLabel={`${c.photos} ${photoIndex + 1}/${entry.photos.length}`} style={styles.dots}>
        {entry.photos.map((photo, index) => <View key={photo.source} style={[styles.dot, { backgroundColor: index === photoIndex ? theme.brand : theme.border }]} />)}
      </View>}
      </>}
    </>}
    <Pressable accessibilityRole="link" style={styles.action} onPress={() => open(entry.article)}>
      <Ionicons name="open-outline" size={18} color={theme.brand} /><Text style={{ color: theme.brand, flexShrink: 1 }}>{c.article}</Text>
    </Pressable>
    {linkFailed && <Text accessibilityRole="alert" style={{ color: theme.muted }}>{c.linkError}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: 8 }, action: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 }, dot: { width: 6, height: 6, borderRadius: 3 },
  online: { fontSize: 11 },
  gallery: { gap: 12, paddingBottom: 10 }, photoCard: { gap: 4 },
  imageFrame: { height: 190, borderRadius: 14, overflow: 'hidden', justifyContent: 'center' }, image: { width: '100%', height: '100%' }, failure: { padding: 8 },
  caption: { fontSize: 12, fontWeight: '600' }, credit: { fontSize: 11 }, links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
