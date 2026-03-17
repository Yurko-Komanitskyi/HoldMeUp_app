import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';

export interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

export function SettingRow({ icon, label, value, onPress, danger, rightElement }: SettingRowProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = danger
    ? '#ef4444'
    : colorScheme === 'dark'
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(0,0,0,0.5)';
  const arrowColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70">
      <View className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-card">
        <Icon as={icon} size={15} color={iconColor} />
      </View>
      <Text
        className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
      {rightElement ?? (
        <View className="flex-row items-center gap-1">
          {value && <Text className="text-sm text-muted-foreground">{value}</Text>}
          {!danger && <Icon as={ChevronRight} size={14} color={arrowColor} />}
        </View>
      )}
    </Pressable>
  );
}
