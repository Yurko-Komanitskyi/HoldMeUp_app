import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

interface ServerErrorBannerProps {
  message: string | null;
}

export function ServerErrorBanner({ message }: ServerErrorBannerProps) {
  if (!message) return null;
  return (
    <View
      style={{
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
        borderRadius: 14,
        padding: 14,
      }}>
      <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>{message}</Text>
    </View>
  );
}
