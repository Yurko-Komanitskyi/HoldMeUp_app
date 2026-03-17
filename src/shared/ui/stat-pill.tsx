import * as React from 'react';
import { View } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ACCENT } from '@/shared/config/palette';

export interface StatPillProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

export function StatPill({ icon, value, label }: StatPillProps) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card py-4">
      <Icon as={icon} size={16} color={ACCENT} />
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
