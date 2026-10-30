import { Platform } from 'react-native';
import { firebaseClient } from './firebaseClient';
import { readCallableResponse } from './callableResponse';
import { friendInviteUrl } from './friendInvite';
import { parseSocialProfile, type SocialProfile } from './socialProfile';
import { socialFingerprint } from './socialSync';

function userId(uid: string | undefined): string {
  if (!uid) throw new Error('Sign in to use friends');
  return uid;
}

/** Callables enforce App Check; native SDK token must accompany Firebase Auth. */
async function callFriendsFunction<T>(name: string, data: Record<string, unknown>): Promise<T> {
  const client = await firebaseClient();
  userId(client.auth.currentUser?.uid);
  if (Platform.OS !== 'android') {
    const { httpsCallable } = await import('firebase/functions');
    const response = await httpsCallable<Record<string, unknown>, T>(client.functions, name)(data);
    return response.data;
  }
  const [{ nativeAppCheckToken }, authToken] = await Promise.all([
    import('./nativeAppCheck'),
    client.auth.currentUser!.getIdToken(),
  ]);
  const appCheck = await nativeAppCheckToken();
  const response = await fetch(`https://us-central1-world-map-1.cloudfunctions.net/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      'X-Firebase-AppCheck': appCheck,
    },
    body: JSON.stringify({ data }),
  });
  return readCallableResponse<T>(response, name);
}

export async function createInvitation(): Promise<string> {
  const result = await callFriendsFunction<{token: string}>('createFriendInvite', {});
  return friendInviteUrl(result.token);
}
export async function acceptInvitation(token: string): Promise<void> {
  await callFriendsFunction('acceptFriendInvite', { token });
}
/** No server reads during normal gameplay; only called on Friends page. */
export async function listFriends(): Promise<Array<{uid: string; profile: SocialProfile | null}>> {
  const [{ collection, doc, getDocs, getDoc }, client] = await Promise.all([import('firebase/firestore'), firebaseClient()]);
  const uid = userId(client.auth.currentUser?.uid);
  const friends = await getDocs(collection(client.db, 'users', uid, 'friends'));
  return Promise.all(friends.docs.map(async record => {
    const snapshot = await getDoc(doc(client.db, 'users', record.id, 'profile', 'public'));
    return { uid: record.id, profile: snapshot.exists() ? parseSocialProfile(snapshot.data()) : null };
  }));
}
/** Caller must invoke only for meaningful local changes while opted in. */
export async function uploadProfile(profile: SocialProfile): Promise<string> {
  const [{ doc, setDoc }, client] = await Promise.all([import('firebase/firestore'), firebaseClient()]);
  const uid = userId(client.auth.currentUser?.uid);
  await setDoc(doc(client.db, 'users', uid, 'profile', 'public'), profile);
  return socialFingerprint(profile);
}

/** Consent withdrawal removes the server-side shared snapshot. */
export async function deleteSharedProfile(): Promise<void> {
  const [{ doc, deleteDoc }, client] = await Promise.all([import('firebase/firestore'), firebaseClient()]);
  const uid = userId(client.auth.currentUser?.uid);
  await deleteDoc(doc(client.db, 'users', uid, 'profile', 'public'));
}
