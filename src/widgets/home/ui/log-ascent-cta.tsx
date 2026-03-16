import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';

interface LogAscentCtaProps {
  onPress: () => void;
}

export function LogAscentCta({ onPress }: LogAscentCtaProps) {
  const { t } = useTranslation();

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 20,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
        activeOpacity={0.88}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.22)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Plus size={26} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>
            {t('home.logAscent')}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            {t('home.logAscentSub')}
          </Text>
        </View>
        <ArrowRight size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </View>
  );
}
