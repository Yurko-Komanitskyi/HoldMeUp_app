import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';

type Props = {
  routeId: string;
  backgroundColor: string;
  textColor: string;
};

export function RouteDetailCta({ routeId, backgroundColor, textColor }: Props) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 28,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
      }}>
      <TouchableOpacity
        onPress={() => router.push(`/ascent/${routeId}` as never)}
        activeOpacity={0.85}
        style={{
          backgroundColor,
          borderRadius: 18,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 10,
        }}>
        <CheckCircle2 size={20} color={textColor} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: textColor, letterSpacing: -0.3 }}>
          Записати пролаз
        </Text>
      </TouchableOpacity>
    </View>
  );
}

