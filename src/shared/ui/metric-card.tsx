import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { LucideIcon } from 'lucide-react-native';

export interface MetricCardProps {
  icon: React.ComponentType<any>;
  value: number | string;
  label: string;
  sub?: string;
  accent?: boolean;
  delay?: number;
}

export function MetricCard({ icon, value, label, sub, accent, delay = 0 }: MetricCardProps) {
  const iconColor = accent ? 'rgb(139, 153, 200)' : 'rgba(255,255,255,0.35)';
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify().damping(16).stiffness(120)}
      className={`flex-1 rounded-2xl border p-4 ${accent ? 'bg-accent/8 border-accent/30' : 'border-border bg-card'}`}>
      <Icon as={icon as LucideIcon} size={18} color={iconColor} />
      <Text className={`mt-3 text-2xl font-bold ${accent ? 'text-accent-foreground' : 'text-foreground'}`}>
        {value}
      </Text>
      <Text className="text-xs font-medium text-foreground">{label}</Text>
      {sub && <Text className="mt-0.5 text-xs text-muted-foreground">{sub}</Text>}
    </Animated.View>
  );
}
