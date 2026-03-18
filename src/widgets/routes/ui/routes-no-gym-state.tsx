import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Mountain } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';

type Props = {
  isDark: boolean;
};

export function RoutesNoGymState({ isDark }: Props) {
  const router = useRouter();

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}
      className="bg-background">
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          backgroundColor: ACCENT + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Mountain size={34} color={ACCENT} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          textAlign: 'center',
          color: isDark ? '#fff' : '#000',
        }}>
        Спочатку оберіть зал
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/gym/join' as never)}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: ACCENT,
        }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Знайти зал</Text>
      </TouchableOpacity>
    </View>
  );
}

