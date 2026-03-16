import * as React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: string;
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FilterChip({
  label,
  active,
  onPress,
  activeColor = ACCENT,
  isDark,
  style,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderColor: active ? activeColor : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'),
          backgroundColor: active ? activeColor + '22' : (isDark ? 'rgba(255,255,255,0.07)' : '#fff'),
        },
        style,
      ]}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: active ? activeColor : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'),
        }}>
        {label}
      </Text>
    </Pressable>
  );
}
