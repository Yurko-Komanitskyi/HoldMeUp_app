import * as React from 'react';
import { View, TextInput } from 'react-native';

import { SectionLabel } from '@/shared/ui/section-label';

interface Props {
  value: string;
  onChange: (value: string) => void;
  cardBg: string;
  borderColor: string;
  inputBg: string;
  inputColor: string;
  placeholderColor: string;
}

export function VideoSection({
  value,
  onChange,
  cardBg,
  borderColor,
  inputBg,
  inputColor,
  placeholderColor,
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
      <SectionLabel>{"Відео (необов'язково)"}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="https://youtube.com/..."
        placeholderTextColor={placeholderColor}
        keyboardType="url"
        autoCapitalize="none"
        style={{
          backgroundColor: inputBg,
          color: inputColor,
          fontSize: 14,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />
    </View>
  );
}

