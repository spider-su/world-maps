import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseProgress, type GameProgress } from './progress';

const KEY = 'world-maps:hot-cold:progress:v1';

export async function loadProgress(): Promise<GameProgress> {
  return parseProgress(await AsyncStorage.getItem(KEY));
}

export async function saveProgress(progress: GameProgress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
}
