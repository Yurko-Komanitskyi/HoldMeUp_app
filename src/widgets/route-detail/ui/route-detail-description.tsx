import * as React from 'react';
import { View } from 'react-native';
import { Info } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';

type Props = {
  description: string;
};

export function RouteDetailDescription({ description }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  if (!description) return null;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Info size={14} color={sectionTitleColor} />
        <Text
          style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#e0e0e8' : '#1a1a2a' }}>
          Опис
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
        }}>
        {description}
      </Text>
    </View>
  );
}

