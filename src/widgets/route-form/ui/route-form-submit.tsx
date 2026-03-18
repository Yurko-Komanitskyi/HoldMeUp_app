import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';

import { Text } from '@/shared/ui/text';

type Props = {
  bgColor: string;
  borderTopColor: string;
  isDark: boolean;
  isSubmitting: boolean;
  uploading: boolean;
  submitLabel: string;
  onSubmit: () => void;
};

export function RouteFormSubmitBar({
  bgColor,
  borderTopColor,
  isDark,
  isSubmitting,
  uploading,
  submitLabel,
  onSubmit,
}: Props) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor,
        backgroundColor: bgColor,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 20,
      }}>
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting || uploading}
        activeOpacity={0.82}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          paddingVertical: 15,
          backgroundColor: isDark ? '#ffffff' : '#000000',
          opacity: isSubmitting || uploading ? 0.55 : 1,
        }}>
        {isSubmitting ? (
          <ActivityIndicator color={isDark ? '#000' : '#fff'} />
        ) : (
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: isDark ? '#000000' : '#ffffff',
              letterSpacing: -0.3,
            }}>
            {submitLabel}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

