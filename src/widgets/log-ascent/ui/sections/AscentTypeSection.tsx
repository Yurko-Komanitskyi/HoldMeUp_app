import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { ASCENT_TYPES, normalizeAscentTypeMetaKey } from '@/entities/ascent/lib/constants';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  ascentType: string;
  disableFlash?: boolean;
  errorText?: string;
  cardBg: string;
  borderColor: string;
  onChange: (value: string) => void;
}

export function AscentTypeSection({
  ascentType,
  disableFlash = false,
  errorText,
  cardBg,
  borderColor,
  onChange,
}: Props) {
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
          const labelKey = normalizeAscentTypeMetaKey(type.value);
          const IconComp = type.icon;
          const isDisabled = disableFlash && type.value === 'FLASH';
          return (
            <TouchableOpacity
              key={type.value}
              disabled={isDisabled}
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
                opacity: isDisabled ? 0.45 : 1,
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
                  {t(`logAscent.ascentTypeLabel.${labelKey}`)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  {t(`logAscent.ascentTypeSublabel.${labelKey}`)}
                </Text>
                {isDisabled ? (
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 3 }}>
                    {t('logAscent.flashDisabledAfterAttempt')}
                  </Text>
                ) : null}
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
      {errorText ? (
        <Text style={{ marginTop: 8, fontSize: 12, color: colors.destructive }}>{errorText}</Text>
      ) : null}
    </View>
  );
}

