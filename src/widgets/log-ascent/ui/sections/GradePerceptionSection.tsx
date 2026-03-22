import * as React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { GRADES } from '@/entities/route/lib/constants';
import { useTranslation } from 'react-i18next';

interface Props {
  gradePerception: string | null;
  cardBg: string;
  borderColor: string;
  onChange: (value: string | null) => void;
}

export function GradePerceptionSection({
  gradePerception,
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
      <SectionLabel>
        {gradePerception
          ? t('logAscent.gradeFeelWith', { grade: gradePerception })
          : t('logAscent.gradeFeel')}
      </SectionLabel>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 10 }}>
        {t('logAscent.gradeFeelHint')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {GRADES.map((g) => {
            const isActive = gradePerception === g;
            return (
              <TouchableOpacity
                key={g}
                onPress={() => onChange(isActive ? null : g)}
                style={{
                  height: 44,
                  minWidth: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? ACCENT : borderColor,
                  backgroundColor: isActive ? ACCENT + '20' : 'transparent',
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: isActive ? ACCENT : colors.mutedForeground,
                  }}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

