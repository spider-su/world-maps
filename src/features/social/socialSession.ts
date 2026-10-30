import { firebaseClient } from './firebaseClient';
import { loadSocialPreferences } from './socialPreferences';
import { sharedProfile } from './socialProfile';
import { needsSocialUpload } from './socialSync';
import type { GameProgress } from '../geography/progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (uid: string) => `@world-maps/social-ack-v1/${uid}`;

/** Explicit, foreground-only sync: no polling, listeners or background jobs. */
export async function syncChangedSocialProfile(progress: GameProgress): Promise<'disabled'|'signed-out'|'unchanged'|'uploaded'> {
  const prefs = await loadSocialPreferences();
  if (!prefs.enabled || prefs.nickname.trim().length < 2) return 'disabled';
  const client = await firebaseClient();
  const uid = client.auth.currentUser?.uid;
  if (!uid) return 'signed-out';
  const profile = sharedProfile(progress, prefs.nickname);
  const previous = await AsyncStorage.getItem(key(uid));
  if (!needsSocialUpload(profile, previous, true, true)) return 'unchanged';
  const { uploadProfile } = await import('./firebaseFriends');
  const fingerprint = await uploadProfile(profile);
  // Acknowledged only after an actual successful server write.
  await AsyncStorage.setItem(key(uid), fingerprint);
  return 'uploaded';
}
