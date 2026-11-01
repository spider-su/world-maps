import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Switch, Text, TextInput, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { useLanguage } from '../../ui/LanguageContext';
import { OptionsSheet } from '../../ui/OptionsSheet';
import { useProgress } from '../geography/ProgressContext';
import { sharedProfile, validateNickname, type SocialProfile } from './socialProfile';
import { loadSocialPreferences, saveSocialPreferences, type SocialPreferences } from './socialPreferences';
import { APP_DOWNLOAD_URL, parseFriendInviteUrl } from './friendInvite';
import { createInvitation, acceptInvitation, listFriends, deleteSharedProfile } from './firebaseFriends';
import { createSocialAccount, signInSocial, signOutSocial, firebaseClient } from './firebaseClient';
import { signInWithGoogle } from './googleSignIn';
import { syncChangedSocialProfile } from './socialSession';
import { FriendInviteQr } from './FriendInviteQr';
import { FriendQrScanner } from './FriendQrScanner';
import { friendsCopy } from './friendsCopy';

function FriendAction({label,icon,onPress,disabled,theme}: {label:string;icon:keyof typeof Ionicons.glyphMap;onPress:()=>void;disabled:boolean;theme:WorldMapsPalette}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{disabled}} style={[styles.button,{backgroundColor:theme.paper,opacity:disabled?.5:1}]} onPress={onPress}><Ionicons name={icon} size={20} color={theme.brand}/><Text style={{color:theme.brand,fontWeight:'600',flexShrink:1}}>{label}</Text></Pressable>;
}
type Job = 'loading'|'saving'|'signingIn'|'creating'|'accepting'|'refreshing'|'sharing'|'signOutBusy';
type Sheet = 'qr'|'scan'|'link'|null;
export function FriendsPanel({ incomingInvite, onInviteHandled }: { incomingInvite?: string; onInviteHandled?: () => void }) {
  const { language } = useLanguage(), c = friendsCopy[language];
  const theme = themeForScheme(useColorScheme()), focused = useIsFocused();
  const { progress } = useProgress();
  const [prefs, setPrefs] = useState<SocialPreferences | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [emailForm, setEmailForm] = useState(false);
  const [userId, setUserId] = useState<string|null>(null), [authLoading, setAuthLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friends, setFriends] = useState<Array<{uid:string;profile:SocialProfile|null}>>([]);
  const [invite, setInvite] = useState(''), [localInvite, setLocalInvite] = useState(''), [link, setLink] = useState('');
  const pending = localInvite || (incomingInvite && parseFriendInviteUrl(incomingInvite) ? incomingInvite : '');
  const [sheet, setSheet] = useState<Sheet>(null), [busy, setBusy] = useState<Job|null>(null);
  const lock = useRef(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const friendlyError = (e: unknown) => {
    const code = e && typeof e === 'object' && 'code' in e ? String(e.code) : '';
    return code === 'functions/failed-precondition' ? c.expired : code.startsWith('auth/') ? c.authError : code === 'functions/permission-denied' ? c.denied : code === 'functions/not-found' ? c.unavailable : c.failure;
  };
  const act = async (job: Job, action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(job); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(friendlyError(e)); }
    finally { lock.current = false; setBusy(null); }
  };
  const load = useCallback(async () => {
    try { const value = await loadSocialPreferences(); setPrefs(value); setNickname(value.nickname); setError(''); }
    catch { setError(c.preferenceError); }
  }, [c.preferenceError]);
  useEffect(() => {
    let active = true;
    loadSocialPreferences().then(value => { if(active) { setPrefs(value); setNickname(value.nickname); } }).catch(() => { if(active) setError(c.preferenceError); });
    return () => { active = false; };
  }, [c.preferenceError]);
  useEffect(() => {
    if (!prefs?.enabled) return;
    let active = true;
    let unsubscribe: (() => void)|undefined;
    void firebaseClient().then(async ({auth}) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      if (active) unsubscribe = onAuthStateChanged(auth, user => { if(active) { setUserId(user?.uid ?? null); setAuthLoading(false); } });
    }).catch(() => { if(active) { setError(c.unavailable); setAuthLoading(false); } });
    return () => { active = false; unsubscribe?.(); };
  }, [prefs?.enabled, c.unavailable]);
  useFocusEffect(useCallback(() => {
    if (!prefs?.enabled || !userId) return;
    let active = true;
    setFriendsLoading(true);
    void listFriends().then(value => { if(active) setFriends(value); }).catch(() => { if(active) setError(c.failure); }).finally(() => { if(active) setFriendsLoading(false); });
    return () => { active = false; };
  }, [prefs?.enabled, userId, c.failure]));
  useEffect(() => {
    if (!focused || !prefs?.enabled || !userId || prefs.nickname.trim().length < 2) return;
    let active = true;
    const timer = setTimeout(() => { void syncChangedSocialProfile(progress).catch(() => { if(active) setError(c.failure); }); }, 1200);
    return () => { active = false; clearTimeout(timer); };
  }, [focused, prefs?.enabled, prefs?.nickname, userId, progress, c.failure]);
  const waitingForAuth = !!prefs?.enabled && authLoading;
  const waitingForFriends = !!prefs?.enabled && !!userId && focused && friendsLoading;
  const disabled = !!busy || waitingForAuth;
  const save = (enabled: boolean) => void act('saving', async () => {
    if (enabled) { try { validateNickname(nickname); } catch { setError(c.nicknameError); return; } }
    if (prefs?.enabled && !enabled && userId) await deleteSharedProfile();
    const next = { enabled, nickname: nickname.trim() };
    await saveSocialPreferences(next); setPrefs(next); setNickname(next.nickname); setNotice(c.saved);
    if (!enabled) { setUserId(null); setAuthLoading(true); setFriendsLoading(false); setFriends([]); setInvite(''); }
  });
  const receive = (url: string) => {
    if (!parseFriendInviteUrl(url.trim())) { setError(c.invalid); return; }
    setLocalInvite(url.trim()); setSheet(null); setLink(''); setError(''); setNotice('');
  };
  const dismiss = () => { setLocalInvite(''); onInviteHandled?.(); };

  const input = (label: string, value: string, change: (value: string)=>void, passwordField = false) => <TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor={theme.muted} value={value} onChangeText={change} editable={!disabled} secureTextEntry={passwordField} autoCapitalize="none" autoCorrect={false} keyboardType={label===c.email ? 'email-address' : 'default'} maxLength={label===c.nickname ? 24 : undefined} style={[styles.input,{color:theme.navy,borderColor:theme.border}]} />;
  let preview: SocialProfile|null = null;
  if (prefs?.enabled) { try { preview = sharedProfile(progress, validateNickname(prefs.nickname)); } catch { /* Name is edited before opt-in. */ } }
  return <View style={[styles.container,{backgroundColor:theme.surface}]}>
    <View style={styles.row}><Ionicons name="people-outline" size={23} color={theme.brand}/><Text accessibilityRole="header" style={[styles.heading,{color:theme.navy}]}>{c.title}</Text></View>
    <Text style={{color:theme.muted}}>{c.intro}</Text>
    {!!pending && <View style={[styles.preview,{backgroundColor:theme.paper}]}>
      <Text accessibilityRole="header" style={[styles.heading,{color:theme.navy}]}>{c.invitation}</Text>
      <Text style={{color:theme.navy}}>{prefs?.enabled && userId ? c.acceptHint : c.requireSignIn}</Text>
      {<FriendAction label={c.accept} icon={'person-add-outline'} onPress={()=>void act('accepting',async()=>{
        const token=parseFriendInviteUrl(pending);if(!token){setError(c.invalid);return;}
        await acceptInvitation(token);dismiss();setNotice(c.added);setFriends(await listFriends());
      })} disabled={disabled || (!prefs?.enabled || !userId)} theme={theme} />}
      {<FriendAction label={c.dismiss} icon={'close-outline'} onPress={dismiss} disabled={disabled || (false)} theme={theme} />}
    </View>}
    {prefs===null ? <>{!error && <ActivityIndicator accessibilityLabel={c.loading} color={theme.brand}/ >}{!!error && <FriendAction label={c.retry} icon={'refresh-outline'} onPress={()=>void load()} disabled={disabled || (false)} theme={theme} />}</> : <>
      {!prefs.enabled && <Text style={{color:theme.muted}}>{c.private}</Text>}
      {input(c.nickname,nickname,setNickname)}
      <View style={styles.row}><Text style={{color:theme.navy,flex:1}}>{c.consent}</Text><Switch accessibilityLabel={c.consent} disabled={disabled} value={prefs.enabled} onValueChange={save}/></View>
      {prefs.enabled && nickname.trim()!==prefs.nickname && <FriendAction label={c.save} icon={'checkmark-outline'} onPress={()=>save(true)} disabled={disabled || (false)} theme={theme} />}
      {!prefs.enabled && <Text style={{color:theme.muted,fontSize:12}}>{c.enableHint}</Text>}
      {prefs.enabled && <>
        {userId ? <>
          <Text style={{color:theme.muted}}>{c.connected}{preview ? ` · ${c.level} ${preview.level} · ${preview.xp} XP` : ''}</Text>
          <View style={styles.actions}>
            {<FriendAction label={c.myQr} icon={'qr-code-outline'} onPress={()=>{setInvite('');setSheet('qr');void act('creating',async()=>{setInvite(await createInvitation());});}} disabled={disabled || (false)} theme={theme} />}
            {<FriendAction label={c.scan} icon={'scan-outline'} onPress={()=>setSheet('scan')} disabled={disabled || (false)} theme={theme} />}
          </View>
          {<FriendAction label={c.paste} icon={'link-outline'} onPress={()=>setSheet('link')} disabled={disabled || (false)} theme={theme} />}
          {<FriendAction label={c.refresh} icon={'refresh-outline'} onPress={()=>void act('refreshing',async()=>{await syncChangedSocialProfile(progress);setFriends(await listFriends());})} disabled={disabled || (false)} theme={theme} />}
          {!friends.length && !busy && <Text style={{color:theme.muted}}>{c.noFriends}</Text>}
          {friends.map(friend=><View key={friend.uid} style={[styles.preview,{backgroundColor:theme.paper}]}><Text style={{color:theme.navy,fontWeight:'700'}}>{friend.profile?.nickname ?? c.friend}</Text><Text style={{color:theme.muted}}>{friend.profile ? `${friend.profile.xp} XP · ${c.level} ${friend.profile.level}` : c.noProfile}</Text></View>)}
          {<FriendAction label={c.signOut} icon={'log-out-outline'} onPress={()=>void act('signOutBusy',async()=>{await signOutSocial();setUserId(null);setFriends([]);setInvite('');setPassword('');})} disabled={disabled || (false)} theme={theme} />}
        </> : authLoading ? null : <>
          <Text style={{color:theme.muted}}>{c.signInHint}</Text>
          {<FriendAction label={c.google} icon={'logo-google'} onPress={()=>void act('signingIn',async()=>{await signInWithGoogle();})} disabled={disabled || (false)} theme={theme} />}
          {<FriendAction label={c.emailOption} icon={'mail-outline'} onPress={()=>setEmailForm(v=>!v)} disabled={disabled || (false)} theme={theme} />}
          {emailForm && <>{input(c.email,email,setEmail)}{input(c.password,password,setPassword,true)}
            {<FriendAction label={c.signIn} icon={'log-in-outline'} onPress={()=>void act('signingIn',async()=>{await signInSocial(email,password);setPassword('');})} disabled={disabled || (!email.trim()||!password)} theme={theme} />}
            {<FriendAction label={c.createAccount} icon={'person-add-outline'} onPress={()=>void act('signingIn',async()=>{await createSocialAccount(email,password);setPassword('');})} disabled={disabled || (!email.trim()||password.length<6)} theme={theme} />}
          </>}
          {<FriendAction label={c.scan} icon={'scan-outline'} onPress={()=>setSheet('scan')} disabled={disabled || (false)} theme={theme} />}
          {<FriendAction label={c.paste} icon={'link-outline'} onPress={()=>setSheet('link')} disabled={disabled || (false)} theme={theme} />}
        </>}
      </>}
    </>}
    {(busy || waitingForAuth || waitingForFriends) && <View accessibilityLiveRegion="polite" style={styles.row}><ActivityIndicator accessibilityLabel={busy ? c[busy] : waitingForFriends ? c.refreshing : c.loading} color={theme.brand}/><Text style={{color:theme.muted}}>{busy ? c[busy] : waitingForFriends ? c.refreshing : c.loading}</Text></View>}
    {!!notice && <Text accessibilityLiveRegion="polite" style={{color:theme.success}}>{notice}</Text>}
    {!!error && <Text accessibilityRole="alert" style={{color:theme.navy}}>{error}</Text>}
    {<FriendAction label={c.shareApp} icon={'share-social-outline'} onPress={()=>void act('sharing',async()=>{await Share.share({title:'World Maps',message:`${c.shareMessage}\n${APP_DOWNLOAD_URL}`,url:APP_DOWNLOAD_URL});})} disabled={disabled || (false)} theme={theme} />}
    <OptionsSheet visible={focused && sheet!==null} title={sheet==='qr' ? c.myQr : sheet==='scan' ? c.scan : c.paste} closeLabel={c.close} onClose={()=>setSheet(null)}>
      {sheet==='qr' && <>
        {busy==='creating' ? <ActivityIndicator accessibilityLabel={c.creating} color={theme.brand}/> : !!invite && <><FriendInviteQr url={invite} label={c.myQr}/><Text style={{color:theme.muted}}>{c.inviteHint}</Text>{<FriendAction label={c.shareInvite} icon={'share-social-outline'} onPress={()=>void act('sharing',async()=>{await Share.share({title:'World Maps',message:`${c.inviteMessage}\n${invite}`,url:invite});})} disabled={disabled || (false)} theme={theme} />}</>}
        {!busy && !invite && <FriendAction label={c.retry} icon={'refresh-outline'} onPress={()=>void act('creating',async()=>setInvite(await createInvitation()))} disabled={disabled || (false)} theme={theme} />}
      </>}
      {focused && sheet==='scan' && <FriendQrScanner language={language} onInvite={receive}/>}
      {sheet==='link' && <>{input(c.placeholder,link,setLink)}{<FriendAction label={c.check} icon={'arrow-forward-outline'} onPress={()=>receive(link)} disabled={disabled || (!link.trim())} theme={theme} />}</>}
      {!!error && <Text accessibilityRole="alert" style={{color:theme.navy}}>{error}</Text>}
    </OptionsSheet>
  </View>;
}
const styles=StyleSheet.create({container:{borderRadius:18,padding:16,gap:12},heading:{fontSize:18,fontWeight:'800'},row:{flexDirection:'row',alignItems:'center',gap:10},input:{borderWidth:1,borderRadius:12,padding:12,minHeight:48},preview:{borderRadius:12,padding:12,gap:10},button:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,minHeight:48,padding:10,borderRadius:12},actions:{gap:8}});
