import * as React from 'react';
import { View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';

export function RouteDetailTip() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        gap: 14,
        borderRadius: 20,
        padding: 16,
        backgroundColor: isDark ? 'rgba(123,173,207,0.08)' : 'rgba(123,173,207,0.12)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(123,173,207,0.18)' : 'rgba(123,173,207,0.25)',
      }}>
      <Zap size={18} color="#7badcf" />
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#c8ddf0' : '#2a5f80' }}>
          {t('routeDetail.tipTitle')}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 13,
            lineHeight: 20,
            color: isDark ? 'rgba(200,221,240,0.7)' : 'rgba(42,95,128,0.75)',
          }}>
          {t('routeDetail.tipBody')}
        </Text>
      </View>
    </View>
  );
}

