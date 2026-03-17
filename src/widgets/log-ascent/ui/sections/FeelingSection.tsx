import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { FEELINGS } from '@/entities/ascent/lib/constants';

interface Props {
  feeling: string | null;
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  onChange: (value: string | null) => void;
}

export function FeelingSection({ feeling, isDark, cardBg, borderColor, onChange }: Props) {
  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>Як відчувалось</SectionLabel>
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
                    : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? f.color : 'transparent',
                  transform: [{ scale: isActive ? 1.1 : 1 }],
                }}>
                <FIcon size={26} color={isActive ? f.color : 'rgba(128,128,128,0.4)'} />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: isActive ? f.color : 'rgba(128,128,128,0.55)',
                  fontWeight: isActive ? '700' : '400',
                  textAlign: 'center',
                }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

