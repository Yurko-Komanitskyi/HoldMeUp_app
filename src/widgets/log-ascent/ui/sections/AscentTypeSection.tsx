import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { ASCENT_TYPES } from '@/entities/ascent/lib/constants';

interface Props {
  ascentType: string;
  isDark: boolean;
  cardBg: string;
  borderColor: string;
  onChange: (value: string) => void;
}

export function AscentTypeSection({ ascentType, isDark, cardBg, borderColor, onChange }: Props) {
  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>Тип пролазу</SectionLabel>
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
                    : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconComp size={20} color={isActive ? type.color : 'rgba(128,128,128,0.6)'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: isActive ? type.color : isDark ? '#fff' : '#000',
                  }}>
                  {type.label}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.7)', marginTop: 2 }}>
                  {type.sublabel}
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
                  <CheckCircle2 size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

