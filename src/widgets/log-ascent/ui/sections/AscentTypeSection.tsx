import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { ASCENT_TYPES } from '@/entities/ascent/lib/constants';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  ascentType: string;
  cardBg: string;
  borderColor: string;
  onChange: (value: string) => void;
}

export function AscentTypeSection({ ascentType, cardBg, borderColor, onChange }: Props) {
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
      <SectionLabel>{t('logAscent.ascentType')}</SectionLabel>
      <View style={{ gap: 8 }}>
        {ASCENT_TYPES.map((type) => {
          const isActive = ascentType === type.value;
          const IconComp = type.icon;
          return (
            <TouchableOpacity
              key={type.value}
              onPress={() => onChange(type.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderRadius: 14,
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? type.color : borderColor,
                backgroundColor: isActive ? type.bg : 'transparent',
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isActive
                    ? type.color + '22'
                    : colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconComp size={20} color={isActive ? type.color : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: isActive ? type.color : colors.foreground,
                  }}>
                  {t(`logAscent.ascentTypeLabel.${type.value}`)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  {t(`logAscent.ascentTypeSublabel.${type.value}`)}
                </Text>
              </View>
              {isActive && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: type.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <CheckCircle2 size={14} color={colors.destructiveForeground} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

