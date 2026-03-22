import * as React from 'react';
import { View, TextInput } from 'react-native';

import { SectionLabel } from '@/shared/ui/section-label';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <SectionLabel>{t('logAscent.videoOptional')}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t('logAscent.videoPlaceholder')}
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

