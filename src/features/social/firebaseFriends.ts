import { firebaseClient } from './firebaseClient';
import { friendInviteUrl } from './friendInvite';
import { parseSocialProfile, type SocialProfile } from './socialProfile';
import { socialFingerprint } from './socialSync';

function userId(uid: string | undefined): string {
  if (!uid) throw new Error('Sign in to use friends');
  return uid;
}
export async function createInvitation(): Promise<string> {
  const [{ httpsCallable }, client] = await Promise.all([import('firebase/functions'), firebaseClient()]);
  const user = userId(client.auth.currentUser?.uid);
  if (!user) throw new Error('Sign in first');
  const result = await httpsCallable<unknown, {token: string}>(client.functions, 'createFriendInvite')({});
  return friendInviteUrl(result.data.token);
}
export async function acceptInvitation(token: string): Promise<void> {
  const [{ httpsCallable }, client] = await Promise.all([import('firebase/functions'), firebaseClient()]);
  userId(client.auth.currentUser?.uid);
  await httpsCallable(client.functions, 'acceptFriendInvite')({ token });
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
