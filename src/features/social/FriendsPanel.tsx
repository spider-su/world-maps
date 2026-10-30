import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Switch, Text, TextInput, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { useLanguage } from '../../ui/LanguageContext';
import { useProgress } from '../geography/ProgressContext';
import { sharedProfile, validateNickname } from './socialProfile';
import { loadSocialPreferences, saveSocialPreferences, type SocialPreferences } from './socialPreferences';
import { parseFriendInviteUrl } from './friendInvite';
import { createInvitation, acceptInvitation, listFriends, deleteSharedProfile } from './firebaseFriends';
import { createSocialAccount, signInSocial, signOutSocial, firebaseClient } from './firebaseClient';
import { signInWithGoogle } from './googleSignIn';
import { syncChangedSocialProfile } from './socialSession';
import { socialActionError } from './socialError';
import type { SocialProfile } from './socialProfile';

const copy = {
  en: { title: 'Friends', status: 'Cloud connection not enabled yet', consent: 'Share my progress with friends', nickname: 'Nickname', preview: 'Your shareable summary', discovered: 'countries', import: 'Invitation link', placeholder: 'Paste an invitation link', check: 'Check link', valid: 'Valid invitation link. Accepting requires Firebase sign-in and deployed functions.', invalid: 'Invalid invitation link', pending: 'Firebase sign-in, QR scanning and invites are not enabled in this build.', saving: 'Could not save social preferences', share: 'Share World Maps' },
  pl: { title: 'Znajomi', status: 'Połączenie z chmurą nie jest jeszcze aktywne', consent: 'Udostępniaj postępy znajomym', nickname: 'Pseudonim', preview: 'Twój udostępniany profil', discovered: 'państw', import: 'Link zaproszenia', placeholder: 'Wklej link zaproszenia', check: 'Sprawdź link', valid: 'Poprawny link. Akceptacja wymaga logowania Firebase i wdrożonych funkcji.', invalid: 'Nieprawidłowy link', pending: 'Logowanie Firebase, skanowanie QR i zaproszenia nie są jeszcze dostępne w tej wersji.', saving: 'Nie udało się zapisać ustawień', share: 'Udostępnij World Maps' },
  ru: { title: 'Друзья', status: 'Облачное подключение пока не включено', consent: 'Делиться прогрессом с друзьями', nickname: 'Имя игрока', preview: 'Ваш профиль для друзей', discovered: 'стран', import: 'Ссылка-приглашение', placeholder: 'Вставьте ссылку', check: 'Проверить ссылку', valid: 'Ссылка верна. Для принятия нужна авторизация Firebase и развернутые функции.', invalid: 'Недействительная ссылка', pending: 'Вход Firebase, QR-сканер и приглашения пока не включены в этой версии.', saving: 'Не удалось сохранить настройки', share: 'Поделиться World Maps' }
};

export function FriendsPanel() {
  const { language } = useLanguage();
  const c = copy[language];
  const theme = themeForScheme(useColorScheme());
  const { progress } = useProgress();
  const [prefs, setPrefs] = useState<SocialPreferences | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Array<{uid:string;profile:SocialProfile|null}>>([]);
  const [invite, setInvite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!prefs?.enabled) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void firebaseClient().then(async ({auth}) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      if (!active) return;
      unsubscribe = onAuthStateChanged(auth, user => { if (active) setUserId(user?.uid ?? null); });
    }).catch(error => { if (active) setError(error instanceof Error ? error.message : String(error)); });
    return () => { active = false; unsubscribe?.(); };
  }, [prefs?.enabled]);
  useEffect(() => {
    if (!prefs?.enabled || !userId || prefs.nickname.trim().length < 2) return;
    const pending = setTimeout(() => {
      void syncChangedSocialProfile(progress).catch(error => setError(error instanceof Error ? error.message : String(error)));
    }, 1200);
    return () => clearTimeout(pending);
  }, [prefs?.enabled, prefs?.nickname, userId, progress]);

  const [link, setLink] = useState('');
  const linkValid = parseFriendInviteUrl(link.trim()) !== null;
  useEffect(() => { let active = true; loadSocialPreferences().then(value => { if(active) setPrefs(value); }).catch(() => { if(active) setError(c.saving); }); return () => { active = false; }; }, [c.saving]);
  const act = async (action: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(socialActionError(e)); }
    finally { setBusy(false); }
  };
  const save = (next: SocialPreferences) => {
    setError('');
    void (async () => {
      // Withdraw remote sharing before switching local consent off.
      if (prefs?.enabled && !next.enabled && userId) await deleteSharedProfile();
      await saveSocialPreferences(next);
      setPrefs(next);
    })().catch(error => setError(error instanceof Error ? error.message : c.saving));
  };
  const preview = prefs?.enabled && prefs.nickname.trim().length >= 2 && prefs.nickname.trim().length <= 24
    ? (() => { try { return sharedProfile(progress, validateNickname(prefs.nickname)); } catch { return null; } })()
    : null;
  return <View style={[styles.container, { backgroundColor: theme.surface }]}>
    <Text style={[styles.heading, { color: theme.navy }]}>{c.title}</Text>
    <Text style={{ color: theme.muted }}>{userId ? `Connected · ${userId.slice(0,6)}…` : c.status}</Text>
    {prefs === null ? <ActivityIndicator /> : <>
      <View style={styles.row}><Text style={[styles.label, { color: theme.navy, flex: 1 }]}>{c.consent}</Text>
        <Switch accessibilityLabel={c.consent} value={prefs.enabled} onValueChange={enabled => save({...prefs, enabled})}/></View>
      <Text style={[styles.label, { color: theme.navy }]}>{c.nickname}</Text>
      <TextInput accessibilityLabel={c.nickname} style={[styles.input, { color: theme.navy, borderColor: theme.border }]} maxLength={24} value={prefs.nickname} onChangeText={nickname => setPrefs({...prefs, nickname})} onEndEditing={() => save(prefs)} />
      {preview && <View style={[styles.preview, { backgroundColor: theme.paper }]}>
        <Text style={[styles.label, { color: theme.navy }]}>{c.preview}: {preview.nickname}</Text>
        <Text style={{ color: theme.muted }}>{preview.level} · {preview.xp} XP · {preview.discovered} {c.discovered}</Text>
      </View>}
      {prefs.enabled && <View style={{ gap: 8 }}>
        <Text style={[styles.label,{ color: theme.navy }]}>Firebase account</Text>
        {userId ? <>
          <Pressable disabled={busy} accessibilityRole="button" style={styles.button} onPress={() => void act(async () => { await syncChangedSocialProfile(progress); setFriends(await listFriends()); })}>
            <Ionicons name="sync-outline" size={19} color={theme.brand}/><Text style={{color:theme.brand}}>Sync changed progress and refresh friends</Text>
          </Pressable>
          <Pressable disabled={busy} accessibilityRole="button" style={styles.button} onPress={() => void act(async () => { const url = await createInvitation(); setInvite(url); await Share.share({message:url}); })}>
            <Ionicons name="qr-code-outline" size={19} color={theme.brand}/><Text style={{color:theme.brand}}>Create invitation link</Text>
          </Pressable>
          {!!invite && <Text selectable style={{color:theme.muted}}>{invite}</Text>}
          <Pressable disabled={busy || !linkValid} accessibilityRole="button" style={styles.button} onPress={() => void act(async () => { const token = parseFriendInviteUrl(link.trim()); if(!token) throw new Error(c.invalid); await acceptInvitation(token); setFriends(await listFriends()); })}>
            <Text style={{color:theme.brand}}>Accept invitation</Text>
          </Pressable>
          {friends.map(friend => <View key={friend.uid} style={[styles.preview,{backgroundColor:theme.paper}]}>
            <Text style={{color:theme.navy,fontWeight:'700'}}>{friend.profile?.nickname ?? 'Friend'}</Text>
            <Text style={{color:theme.muted}}>{friend.profile ? `${friend.profile.xp} XP · Level ${friend.profile.level}` : 'No shared profile yet'}</Text>
          </View>)}
          <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void act(async () => { await signOutSocial(); setUserId(null); setFriends([]); })}><Text style={{color:theme.brand}}>Sign out</Text></Pressable>
        </> : <>
          <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void act(async () => { await signInWithGoogle(); })}><Ionicons name="logo-google" size={20} color={theme.brand}/><Text style={{color:theme.brand,fontWeight:"700"}}>Continue with Google</Text></Pressable>
          <TextInput accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" style={[styles.input,{color:theme.navy,borderColor:theme.border}]} />
          <TextInput accessibilityLabel="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Password (6+ characters)" style={[styles.input,{color:theme.navy,borderColor:theme.border}]} />
          <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void act(async () => { const result = await signInSocial(email,password); setUserId(result.user.uid); await syncChangedSocialProfile(progress); })}><Text style={{color:theme.brand}}>Sign in</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={busy} style={styles.button} onPress={() => void act(async () => { const result = await createSocialAccount(email,password); setUserId(result.user.uid); await syncChangedSocialProfile(progress); })}><Text style={{color:theme.brand}}>Create account</Text></Pressable>
        </>}
      </View>}
      <Text style={[styles.label, { color: theme.navy }]}>{c.import}</Text>
      <TextInput accessibilityLabel={c.import} style={[styles.input, { color: theme.navy, borderColor: theme.border }]} value={link} autoCapitalize="none" autoCorrect={false} onChangeText={setLink} placeholder={c.placeholder} />
      <View style={[styles.button, { backgroundColor: theme.paper }]}>
        <Ionicons name="link-outline" size={19} color={theme.brand} /><Text style={{ color: theme.brand, fontWeight: '700' }}>{c.check}</Text>
      </View>
      {link.trim().length > 0 && <Text style={{ color: theme.muted }}>{linkValid ? c.valid : c.invalid}</Text>}
      <Text style={{ color: theme.muted, fontSize: 12 }}>Invitations require deployed Firebase Functions and valid App Check configuration. QR scanning is not yet available; paste a link above.</Text>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => { void Share.share({ message: 'World Maps' }); }}>
        <Ionicons name="share-social-outline" size={18} color={theme.brand}/><Text style={{ color: theme.brand }}>{c.share}</Text>
      </Pressable>
    </>}
    {!!error && <Text accessibilityRole="alert" style={{ color: '#B53D32' }}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  container: { borderRadius: 18, padding: 16, gap: 12 },
  heading: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 48 },
  preview: { borderRadius: 12, padding: 12, gap: 4 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 12 }
});
