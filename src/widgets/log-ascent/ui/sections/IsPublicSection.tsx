import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Globe, Lock } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  isPublic: boolean;
  cardBg: string;
  borderColor: string;
  onChange: (value: boolean) => void;
}

export function IsPublicSection({ isPublic, cardBg, borderColor, onChange }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const options = [
    {
      val: true,
      label: t('logAscent.publicLabel', { defaultValue: 'Публічно' }),
      sublabel: t('logAscent.publicSublabel', { defaultValue: 'Бачать усі' }),
      Icon: Globe,
      color: '#22c55e',
    },
    {
      val: false,
      label: t('logAscent.privateLabel', { defaultValue: 'Лише я' }),
      sublabel: t('logAscent.privateSublabel', { defaultValue: 'Тільки для тебе' }),
      Icon: Lock,
      color: '#6b7280',
    },
  ] as const;

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>{t('logAscent.visibility', { defaultValue: 'Видимість' })}</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {options.map(({ val, label, sublabel, Icon, color }) => {
          const active = isPublic === val;
          return (
            <TouchableOpacity
              key={String(val)}
              onPress={() => onChange(val)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 8,
                borderRadius: 14,
                borderWidth: active ? 2 : 1,
                borderColor: active ? color : borderColor,
                backgroundColor: active ? color + '1a' : 'transparent',
                gap: 6,
              }}>
              <Icon size={22} color={active ? color : colors.mutedForeground} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: active ? color : colors.mutedForeground,
                }}>
                {label}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: active ? color + 'bb' : colors.mutedForeground,
                  textAlign: 'center',
                }}>
                {sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
