import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { useLanguage } from '../ui/LanguageContext';
import { OptionsSheet } from '../ui/OptionsSheet';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import { gameCopy } from '../features/geography/copy';
import { profileCopy } from '../features/geography/profileCopy';
import { EXPLORERS, EXPLORER_STAGES } from '../features/geography/explorer';
import { ExplorerAvatar } from '../features/geography/ExplorerAvatar';
import { explorerProgress, DISCOVERY_XP, CORRECT_XP, FIRST_TRY_XP, XP_PER_LEVEL, type AchievementId } from '../features/geography/explorerProgress';

const badgeIcons = { 'first-discovery': 'footsteps-outline', curious: 'compass-outline', collector: 'albums-outline', 'sharp-eye': 'flash-outline', 'all-rounder': 'ribbon-outline', globetrotter: 'earth-outline' } as const;

export function ProfileScreen() {
  const { language } = useLanguage();
  const { progress, status, update } = useProgress();
  const { setMapId } = useMap();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Profile'>>();
  const c = gameCopy[language];
  const p = profileCopy[language];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [sheet, setSheet] = useState<'explorer' | 'badges' | 'xp' | null>(null);
  const journey = useMemo(() => explorerProgress(progress), [progress]);
  const scroll = useRef<ScrollView>(null);
  const lastXP = useRef<number | undefined>(undefined);
  const available = status !== 'loading' && status !== 'read-error';
  useFocusEffect(useCallback(() => {
    if (available && lastXP.current !== journey.xp) {
      scroll.current?.scrollTo({y:0,animated:false});
      lastXP.current=journey.xp;
    }
  },[available,journey.xp]));
  const nextBadge = journey.achievements.filter(b => !b.earned).sort((a,b) => b.current / b.target - a.current / a.target)[0];
  const badges = [...journey.achievements].sort((a,b) => Number(b.earned) - Number(a.earned)).slice(0,3);
  const badge = (id: AchievementId, earned: boolean, size = 25) => <View style={[styles.badgeIcon, { backgroundColor: earned ? theme.mode['name-it'].tint : theme.paper }]}><Ionicons name={badgeIcons[id]} size={size} color={earned ? theme.mode['name-it'].foreground : theme.muted} /></View>;
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <ScrollView ref={scroll} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}><Text accessibilityRole="header" style={styles.title}>{c.profile}</Text><Pressable accessibilityRole="button" accessibilityLabel={p.howXP} style={styles.iconButton} onPress={() => setSheet('xp')}><Ionicons name="help-circle-outline" size={24} color={theme.muted} /></Pressable></View>
      <ProgressStatus language={language} />
      {status === 'loading' && <Text style={styles.hint}>{c.loading}</Text>}
      {available && <>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{p.journey}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={p.chooseExplorer} onPress={() => setSheet('explorer')} style={styles.avatar}>
            <ExplorerAvatar explorer={progress.explorer} stage={journey.stage} label={p.ranks[journey.stage]!} />
            <View style={styles.edit}><Ionicons name="pencil" size={14} color={theme.brand} /></View>
          </Pressable>
          <Text style={styles.level}>{p.level} {journey.level} · {p.ranks[journey.stage]}</Text>
          <Text style={styles.xp}>{journey.xp} {p.xp}</Text>
          <View accessibilityRole="progressbar" accessibilityLabel={`${p.level} ${journey.level}`} accessibilityValue={{ min: 0, max: XP_PER_LEVEL, now: journey.levelXP }} style={styles.xpBar}><View style={[styles.xpFill, {width:`${100 * journey.levelXP / XP_PER_LEVEL}%`}]} /></View>
          <Text style={styles.hint}>{journey.nextLevelXP} {p.xp} {p.toNext}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={p.outfitsTitle} onPress={() => setSheet('explorer')} style={styles.outfitLink}>
            <Ionicons name="shirt-outline" size={19} color={theme.brand} /><Text style={styles.outfitText}>{journey.nextOutfitLevel ? `${p.nextOutfit} · ${p.level} ${journey.nextOutfitLevel}` : p.outfitsTitle}</Text><Ionicons name="chevron-forward" size={16} color={theme.muted} />
          </Pressable>
        </View>
        <View style={styles.metrics}>{[[p.discovered,journey.discovered],[p.mastered,journey.mastered],[p.correct,journey.correct]].map(([label,value]) => <View key={label} style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>)}</View>
        {nextBadge && <View style={styles.goal}>
          {badge(nextBadge.id,false)}<View style={styles.grow}><Text style={styles.hint}>{p.nextMilestone}</Text><Text style={styles.goalTitle}>{p.badges[nextBadge.id].title}</Text><Text style={styles.detail}>{p.badges[nextBadge.id].detail}</Text></View><Text style={styles.count}>{nextBadge.current}/{nextBadge.target}</Text>
        </View>}
        <View style={styles.titleRow}><Text accessibilityRole="header" style={styles.section}>{p.achievements}</Text><Pressable accessibilityRole="button" accessibilityLabel={p.allBadges} style={styles.iconButton} onPress={() => setSheet('badges')}><Ionicons name="arrow-forward" size={22} color={theme.brand} /></Pressable></View>
        <View style={styles.badges}>{badges.map(b => <Pressable key={b.id} accessibilityRole="button" accessibilityLabel={`${p.badges[b.id].title}. ${b.earned ? p.earned : `${b.current}/${b.target}`}`} onPress={() => setSheet('badges')} style={styles.badgeTile}>{badge(b.id,b.earned)}<Text style={styles.badgeTitle}>{p.badges[b.id].title}</Text>{b.earned ? <Ionicons name="checkmark-circle" size={16} color={theme.success} /> : <Text style={styles.hint}>{b.current}/{b.target}</Text>}</Pressable>)}</View>
        <Text accessibilityRole="header" style={styles.section}>{p.yourMaps}</Text>
        {journey.maps.map(map => <Pressable key={map.id} accessibilityRole="button" accessibilityLabel={`${mapName(map.id,language)}. ${map.discovered}/${map.total} ${p.discovered}`} onPress={() => { setMapId(map.id); navigation.navigate('Explore'); }} style={styles.map}>
          <View style={styles.titleRow}><Text style={styles.mapTitle}>{mapName(map.id,language)}</Text><Text style={styles.hint}>{map.discovered}/{map.total}</Text><Ionicons name="chevron-forward" size={16} color={theme.muted} /></View>
          <View style={styles.mapBar}><View style={[styles.xpFill,{width:`${100 * map.discovered / map.total}%`}]} /></View>
        </Pressable>)}
      </>}
    </ScrollView>
    <OptionsSheet visible={sheet === 'explorer' && available} title={p.chooseExplorer} closeLabel={c.close} onClose={() => setSheet(null)}>
      <View accessibilityRole="radiogroup" accessibilityLabel={p.chooseExplorer} style={styles.explorers}>{EXPLORERS.map(id => <Pressable key={id} accessibilityRole="radio" aria-checked={progress.explorer === id} accessibilityState={{ checked:progress.explorer === id }} accessibilityLabel={p.explorers[id]} onPress={() => update(current => current.explorer === id ? current : ({...current,explorer:id}))} style={[styles.explorerChoice,progress.explorer === id && styles.chosen]}><ExplorerAvatar explorer={id} stage={journey.stage} size={76} label={p.explorers[id]} /><Text style={styles.choiceText}>{p.explorers[id]}</Text></Pressable>)}</View>
      <ProgressStatus language={language} />
      <Text accessibilityRole="header" style={styles.section}>{p.outfitsTitle}</Text>
      {EXPLORER_STAGES.map((level,index) => <View key={level} style={[styles.outfitRow,journey.level < level && styles.locked]}><ExplorerAvatar explorer={progress.explorer} stage={index} size={64} label={p.ranks[index]!} /><View style={styles.grow}><Text style={styles.goalTitle}>{p.ranks[index]} · {p.level} {level}</Text><Text style={styles.detail}>{p.outfits[index]}</Text></View><Ionicons accessibilityLabel={journey.level >= level ? p.unlocked : p.locked} name={journey.level >= level ? 'checkmark-circle' : 'lock-closed-outline'} size={20} color={journey.level >= level ? theme.success : theme.muted} /></View>)}
    </OptionsSheet>
    <OptionsSheet visible={sheet === 'badges' && available} title={p.achievements} closeLabel={c.close} onClose={() => setSheet(null)}>
      {journey.achievements.map(b => <View key={b.id} style={styles.goal}>{badge(b.id,b.earned)}<View style={styles.grow}><Text style={styles.goalTitle}>{p.badges[b.id].title}</Text><Text style={styles.detail}>{p.badges[b.id].detail}</Text></View>{b.earned ? <Ionicons accessibilityLabel={p.earned} name="checkmark-circle" size={22} color={theme.success} /> : <Text style={styles.count}>{b.current}/{b.target}</Text>}</View>)}
    </OptionsSheet>
    <OptionsSheet visible={sheet === 'xp'} title={p.howXP} closeLabel={c.close} onClose={() => setSheet(null)}>
      {[[p.discoveryReward,DISCOVERY_XP],[p.quizReward,CORRECT_XP],[p.firstTryReward,FIRST_TRY_XP]].map(([label,xp]) => <View key={label} style={styles.titleRow}><Text style={styles.detail}>{label}</Text><Text style={styles.goalTitle}>+{xp} {p.xp}</Text></View>)}
      <Text style={styles.detail}>{p.xpHint}</Text><Text style={styles.detail}>{p.masteryHint}</Text>
    </OptionsSheet>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: {flex:1,backgroundColor:theme.paper},content:{padding:18,gap:12,paddingBottom:28},
  titleRow:{flexDirection:'row',alignItems:'center',gap:10,justifyContent:'space-between'},title:{fontSize:26,fontWeight:'800',color:theme.navy},
  iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},
  hero:{alignItems:'center',backgroundColor:theme.surface,borderRadius:24,padding:18,gap:8},eyebrow:{color:theme.muted,fontSize:12,fontWeight:'600'},avatar:{position:'relative'},edit:{position:'absolute',bottom:5,right:6,width:28,height:28,borderRadius:14,backgroundColor:theme.paper,alignItems:'center',justifyContent:'center'},
  level:{fontSize:21,fontWeight:'800',color:theme.navy,textAlign:'center'},xp:{fontSize:13,fontWeight:'700',color:theme.brand},hint:{fontSize:11,color:theme.muted,lineHeight:16},
  xpBar:{height:9,width:'100%',borderRadius:5,backgroundColor:theme.ocean,overflow:'hidden',marginTop:4},xpFill:{height:'100%',backgroundColor:theme.brand,borderRadius:5},
  outfitLink:{flexDirection:'row',alignItems:'center',gap:8,minHeight:44,marginTop:3},outfitText:{flexShrink:1,color:theme.brand,fontSize:12,fontWeight:'600'},
  metrics:{flexDirection:'row',gap:8},metric:{flex:1,backgroundColor:theme.surface,borderRadius:16,padding:12,gap:4,alignItems:'center'},metricValue:{fontSize:22,fontWeight:'800',color:theme.navy},metricLabel:{fontSize:11,lineHeight:15,textAlign:'center',color:theme.muted},
  section:{fontSize:17,fontWeight:'800',color:theme.navy},goal:{flexDirection:'row',alignItems:'center',gap:12,padding:12,backgroundColor:theme.surface,borderRadius:16},grow:{flex:1,gap:4},goalTitle:{color:theme.navy,fontWeight:'700',fontSize:14},detail:{color:theme.muted,fontSize:12,lineHeight:18,flexShrink:1},count:{color:theme.brand,fontWeight:'700',fontSize:12},
  badges:{flexDirection:'row',gap:8},badgeTile:{flex:1,alignItems:'center',backgroundColor:theme.surface,padding:12,borderRadius:16,gap:8},badgeIcon:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'},badgeTitle:{fontSize:11,lineHeight:15,color:theme.navy,fontWeight:'700',textAlign:'center'},
  map:{backgroundColor:theme.surface,padding:14,borderRadius:16,gap:10},mapTitle:{color:theme.navy,fontWeight:'700',fontSize:14,flex:1},mapBar:{height:5,backgroundColor:theme.ocean,borderRadius:3,overflow:'hidden'},
  explorers:{flexDirection:'row',gap:8},explorerChoice:{flex:1,alignItems:'center',borderRadius:16,borderWidth:2,borderColor:'transparent',paddingVertical:8,backgroundColor:theme.paper},chosen:{borderColor:theme.brand},choiceText:{color:theme.navy,fontSize:12,fontWeight:'600'},outfitRow:{flexDirection:'row',alignItems:'center',gap:12},locked:{opacity:0.55},
});
