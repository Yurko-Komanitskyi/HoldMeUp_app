import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

export function AscentDetailRouteStrip({ color }: { color?: string }) {
  if (!color) return null;
  return (
    <View
      style={{
        width: 5,
        borderRadius: 3,
        backgroundColor: color,
        alignSelf: 'stretch',
      }}
    />
  );
}

export function AscentDetailInfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">{children}</View>
    </View>
  );
}
