import * as React from 'react';
import { View, TextInput } from 'react-native';

import { Text } from '@/shared/ui/text';
import { SectionLabel } from '@/shared/ui/section-label';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

interface Props {
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
  cardBg: string;
  borderColor: string;
  inputBg: string;
  inputColor: string;
  placeholderColor: string;
}

export function NotesSection({
  value,
  onChange,
  errorText,
  cardBg,
  borderColor,
  inputBg,
  inputColor,
  placeholderColor,
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
      {errorText ? (
        <Text style={{ marginTop: 8, fontSize: 12, color: colors.destructive }}>{errorText}</Text>
      ) : null}
    </View>
  );
}

