import * as React from 'react';
import { View, TextInput } from 'react-native';

import { Text } from '@/shared/ui/text';
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

export function EditAscentTimeSection({
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
      <SectionLabel>{t('ascentDetail.statTime')}</SectionLabel>
      <Text style={{ fontSize: 12, color: placeholderColor, marginBottom: 8 }}>
        {t('ascentDetail.timeHint')}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={placeholderColor}
        style={{
          backgroundColor: inputBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: inputColor,
        }}
      />
    </View>
  );
}
