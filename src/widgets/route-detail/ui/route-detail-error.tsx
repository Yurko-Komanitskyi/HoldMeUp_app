import * as React from 'react';
import { View, Pressable } from 'react-native';

import { AlertCircle } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';

type Props = {
  onRetry: () => void;
};

export function RouteDetailError({ onRetry }: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 32,
      }}
      className="bg-background">
      <AlertCircle size={48} color="#ef4444" />
      <Text className="text-center text-base font-semibold text-foreground">
        Не вдалося завантажити маршрут
      </Text>
      <Pressable
        onPress={onRetry}
        style={{ borderRadius: 14, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 12 }}
        className="border-border bg-card">
        <Text className="text-sm font-medium text-foreground">Спробувати знову</Text>
      </Pressable>
    </View>
  );
}

