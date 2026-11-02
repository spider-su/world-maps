import { beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialProgress } from '../geography/progress';
import { firebaseClient } from './firebaseClient';
import { uploadProfile } from './firebaseFriends';
import { loadSocialPreferences } from './socialPreferences';
import { sharedProfile } from './socialProfile';
import { socialFingerprint } from './socialSync';
import { syncChangedSocialProfile } from './socialSession';

vi.mock('@react-native-async-storage/async-storage', () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }));
vi.mock('./firebaseClient', () => ({ firebaseClient: vi.fn() }));
vi.mock('./firebaseFriends', () => ({ uploadProfile: vi.fn() }));
vi.mock('./socialPreferences', () => ({ loadSocialPreferences: vi.fn() }));

const getItem = vi.mocked(AsyncStorage.getItem), setItem = vi.mocked(AsyncStorage.setItem);
const preferences = vi.mocked(loadSocialPreferences), client = vi.mocked(firebaseClient), upload = vi.mocked(uploadProfile);
const account = (uid: string | null) => ({ auth: { currentUser: uid ? { uid } : null } } as unknown as Awaited<ReturnType<typeof firebaseClient>>);
const key = '@world-maps/social-ack-v1/alice';

beforeEach(() => {
  vi.resetAllMocks();
  preferences.mockResolvedValue({ enabled: true, nickname: 'Atlas' });
  client.mockResolvedValue(account('alice'));
  getItem.mockResolvedValue(null);
  setItem.mockResolvedValue();
  upload.mockImplementation(async profile => socialFingerprint(profile));
});

describe('foreground social sync coordinator', () => {
  it('does not initialize Firebase without consent or a usable nickname', async () => {
    for (const prefs of [{ enabled: false, nickname: 'Atlas' }, { enabled: true, nickname: ' ' }]) {
      preferences.mockResolvedValue(prefs);
      expect(await syncChangedSocialProfile(initialProgress)).toBe('disabled');
    }
    expect(client).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('does not inspect acknowledgement storage or upload while signed out', async () => {
    client.mockResolvedValue(account(null));
    expect(await syncChangedSocialProfile(initialProgress)).toBe('signed-out');
    expect(getItem).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('skips an acknowledged summary even though its timestamp is different', async () => {
    getItem.mockResolvedValue(socialFingerprint(sharedProfile(initialProgress, 'Atlas', 1)));
    expect(await syncChangedSocialProfile(initialProgress)).toBe('unchanged');
    expect(getItem).toHaveBeenCalledWith(key);
    expect(upload).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('acknowledges a meaningful change only after the remote write succeeds', async () => {
    getItem.mockResolvedValue(socialFingerprint(sharedProfile(initialProgress, 'Old nickname', 1)));
    let confirm!: (value: string) => void;
    upload.mockReturnValue(new Promise(resolve => { confirm = resolve; }));
    const pending = syncChangedSocialProfile(initialProgress);
    await vi.waitFor(() => expect(upload).toHaveBeenCalledOnce());
    expect(setItem).not.toHaveBeenCalled();
    const sent = upload.mock.calls[0]![0];
    expect(sent.nickname).toBe('Atlas');
    const fingerprint = socialFingerprint(sent);
    confirm(fingerprint);
    expect(await pending).toBe('uploaded');
    expect(setItem).toHaveBeenCalledWith(key, fingerprint);
  });

  it('leaves failed uploads unacknowledged so a later foreground retry can send them', async () => {
    upload.mockRejectedValueOnce(new Error('offline'));
    await expect(syncChangedSocialProfile(initialProgress)).rejects.toThrow('offline');
    expect(setItem).not.toHaveBeenCalled();
    expect(await syncChangedSocialProfile(initialProgress)).toBe('uploaded');
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('keeps successful acknowledgement keys separate for each signed-in account', async () => {
    await syncChangedSocialProfile(initialProgress);
    client.mockResolvedValue(account('bob'));
    await syncChangedSocialProfile(initialProgress);
    expect(getItem.mock.calls.map(([storageKey]) => storageKey)).toEqual([key, '@world-maps/social-ack-v1/bob']);
    expect(setItem.mock.calls.map(([storageKey]) => storageKey)).toEqual([key, '@world-maps/social-ack-v1/bob']);
  });

  it('surfaces a failed acknowledgement read without uploading or replacing the marker', async () => {
    getItem.mockRejectedValueOnce(new Error('storage read'));
    await expect(syncChangedSocialProfile(initialProgress)).rejects.toThrow('storage read');
    expect(upload).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it('does not report success when the remote write succeeds but local acknowledgement fails', async () => {
    setItem.mockRejectedValueOnce(new Error('storage write'));
    await expect(syncChangedSocialProfile(initialProgress)).rejects.toThrow('storage write');
    expect(upload).toHaveBeenCalledOnce();
    expect(await syncChangedSocialProfile(initialProgress)).toBe('uploaded');
    expect(upload).toHaveBeenCalledTimes(2);
  });
});
