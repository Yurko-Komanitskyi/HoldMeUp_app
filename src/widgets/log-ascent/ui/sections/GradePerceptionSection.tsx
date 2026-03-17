import * as React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { ACCENT } from '@/shared/config/palette';
import { GRADES } from '@/entities/route/lib/constants';

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
          ? `Складність по відчуттю — ${gradePerception}`
          : 'Складність по відчуттю'}
      </SectionLabel>
      <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)', marginBottom: 10 }}>
        Який грейд цей маршрут заслуговує на твою думку?
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
                    color: isActive ? ACCENT : 'rgba(128,128,128,0.7)',
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

