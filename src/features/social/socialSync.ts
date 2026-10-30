import type { SocialProfile } from './socialProfile';

/** Timestamp is server metadata, not a reason to upload a new snapshot. */
export function socialFingerprint(profile: SocialProfile): string {
  const { nickname, explorer, xp, level, discovered, mastered, badges } = profile;
  return JSON.stringify([nickname, explorer, xp, level, discovered, mastered, [...badges].sort()]);
}

/** Upload only when social sharing is explicitly enabled, connected, and the
 * latest successful server acknowledgement differs from local data.
 * A failed upload must never advance the acknowledgement.
 */
export function needsSocialUpload(profile: SocialProfile, acknowledgedFingerprint: string | null,
  enabled: boolean, connected: boolean): boolean {
  return enabled && connected && socialFingerprint(profile) !== acknowledgedFingerprint;
}

/** Deduplicate profile fetches by revision; reconnect does not imply a read.
 * Cache is local and revision comes from a lightweight friends index or push event.
 */
export function needsFriendFetch(cachedRevision: number | null, remoteRevision: number): boolean {
  return cachedRevision === null || cachedRevision !== remoteRevision;
}
