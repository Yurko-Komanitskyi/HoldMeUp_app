import AsyncStorage from '@react-native-async-storage/async-storage';

const keyForUser = (userId: string) => `@holdmeup/leaderboard/custom-rival-ids/${userId}`;

export async function loadCustomLeaderboardRivalIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const raw = await AsyncStorage.getItem(keyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch {
    return [];
  }
}

export async function saveCustomLeaderboardRivalIds(userId: string, ids: Iterable<string>): Promise<void> {
  if (!userId) return;
  try {
    const arr = [...ids];
    await AsyncStorage.setItem(keyForUser(userId), JSON.stringify(arr));
  } catch {
    // ignore quota / IO errors
  }
}
