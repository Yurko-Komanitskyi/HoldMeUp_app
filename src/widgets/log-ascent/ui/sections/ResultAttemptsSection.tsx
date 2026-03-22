import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, ChevronUp, ChevronDown } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  success: boolean;
  attemptNumber: number;
  cardBg: string;
  borderColor: string;
  onChangeSuccess: (value: boolean) => void;
  onChangeAttempt: (updater: (n: number) => number) => void;
}

//todo: add auto increment for attempt number

export function ResultAttemptsSection({
  success,
  attemptNumber,
  cardBg,
  borderColor,
  onChangeSuccess,
  onChangeAttempt,
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
        gap: 20,
      }}>
      <View>
        <SectionLabel>{t('logAscent.result')}</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { val: true, label: t('logAscent.send'), icon: CheckCircle2, colorKey: 'chart2' as const },
            { val: false, label: t('logAscent.fall'), icon: XCircle, colorKey: 'destructive' as const },
          ].map(({ val, label, icon: BtnIcon, colorKey }) => {
            const color = colors[colorKey];
            const active = success === val;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => onChangeSuccess(val)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? color : borderColor,
                  backgroundColor: active ? color + '1a' : 'transparent',
                }}>
                <BtnIcon size={20} color={active ? color : colors.mutedForeground} />
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: active ? color : colors.mutedForeground,
                  }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View>
        <SectionLabel>{t('logAscent.attemptNumber')}</SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity
            onPress={() => onChangeAttempt((n) => Math.max(1, n - 1))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.muted,
            }}>
            <ChevronDown size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 36,
                lineHeight: 42,
                fontWeight: '200',
                color: colors.foreground,
              }}>
              {attemptNumber}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: -4 }}>
              {attemptNumber === 1 ? t('logAscent.firstAttempt') : t('logAscent.attempt')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onChangeAttempt((n) => n + 1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.muted,
            }}>
            <ChevronUp size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

