const KEY = '@world-maps/social-consent-v1';
export interface SocialPreferences { enabled: boolean; nickname: string; }
export const DEFAULT_SOCIAL_PREFERENCES: SocialPreferences = { enabled: false, nickname: '' };

export function parseSocialPreferences(raw: string | null): SocialPreferences {
  if (!raw) return DEFAULT_SOCIAL_PREFERENCES;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return DEFAULT_SOCIAL_PREFERENCES;
    const record = value as Record<string, unknown>;
    return {
      enabled: record.enabled === true,
      nickname: typeof record.nickname === 'string' ? record.nickname.slice(0, 24) : '',
    };
  } catch { return DEFAULT_SOCIAL_PREFERENCES; }
}
export async function loadSocialPreferences(): Promise<SocialPreferences> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  return parseSocialPreferences(await AsyncStorage.getItem(KEY));
}
export async function saveSocialPreferences(value: SocialPreferences): Promise<void> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}
