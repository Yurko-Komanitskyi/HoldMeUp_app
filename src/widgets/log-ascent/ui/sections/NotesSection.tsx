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

export function NotesSection({
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
      <SectionLabel>{t('logAscent.notesOptional')}</SectionLabel>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        placeholder={t('logAscent.notesPlaceholder')}
        placeholderTextColor={placeholderColor}
        style={{
          backgroundColor: inputBg,
          color: inputColor,
          fontSize: 14,
          borderRadius: 12,
          padding: 14,
          minHeight: 88,
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
}

