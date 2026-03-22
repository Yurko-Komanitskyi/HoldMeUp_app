import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';

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

export function AscentDetailFeelingStars({ value }: { value: number }) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          className={cn(
            'h-6 w-6 items-center justify-center rounded-full',
            i <= value ? 'bg-accent' : 'bg-muted'
          )}>
          <Text
            className={cn(
              'text-xs',
              i <= value ? 'text-accent-foreground' : 'text-muted-foreground'
            )}>
            ★
          </Text>
        </View>
      ))}
    </View>
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
