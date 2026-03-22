import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { FEELINGS } from '@/entities/ascent/lib/constants';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  feeling: string | null;
  cardBg: string;
  borderColor: string;
  onChange: (value: string | null) => void;
}

export function FeelingSection({ feeling, cardBg, borderColor, onChange }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>{t('logAscent.howItFelt')}</SectionLabel>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {FEELINGS.map((f) => {
          const isActive = feeling === f.value.toString();
          const FIcon = f.icon;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => onChange(isActive ? null : f.value.toString())}
              style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: isActive
                    ? f.color + '20'
                    : colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? f.color : 'transparent',
                  transform: [{ scale: isActive ? 1.1 : 1 }],
                }}>
                <FIcon size={26} color={isActive ? f.color : colors.mutedForeground} />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: isActive ? f.color : colors.mutedForeground,
                  fontWeight: isActive ? '700' : '400',
                  textAlign: 'center',
                }}>
                {t(`logAscent.feeling.${f.value}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

