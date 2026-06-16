import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mountain } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useTranslation } from 'react-i18next';

type Props = {
  isDark: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function RoutesEmptyState({ isDark, hasActiveFilters, onClearFilters }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View
      entering={FadeInDown.delay(0).duration(400).springify().damping(18)}
      style={{
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        paddingVertical: 56,
        paddingHorizontal: 24,
      }}
      className="border-border">
      <Mountain size={44} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          fontWeight: '600',
          color: isDark ? '#fff' : '#000',
        }}>
        {hasActiveFilters ? t('routes.emptyTitleFiltered') : t('routes.emptyTitleDefault')}
      </Text>
      <Text
        style={{
          marginTop: 6,
          textAlign: 'center',
          fontSize: 13,
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          lineHeight: 18,
        }}>
        {hasActiveFilters ? t('routes.emptyHintFiltered') : t('routes.emptyHintDefault')}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity
          onPress={onClearFilters}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: ACCENT,
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{t('routes.clearFilters')}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

