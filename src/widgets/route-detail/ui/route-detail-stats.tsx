import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

type StatCardProps = {
  value: string | number;
  label: string;
  color: string;
};

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: 'rgba(15,23,42,0.96)',
      }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: 'rgba(148,163,184,1)',
          letterSpacing: 0.3,
          marginBottom: 6,
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color,
          letterSpacing: -0.5,
        }}>
        {value}
      </Text>
    </View>
  );
}

type Props = {
  ascentCount: number;
  flashRate: number | string | null;
  flashCount: number;
  rating: number | string | null;
  isDark: boolean;
};

export function RouteDetailStats({ ascentCount, flashRate, flashCount, rating, isDark }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20 }}>
      <StatCard value={ascentCount} label="Пролазів" color="#7badcf" />
      {flashRate !== null ? (
        <StatCard value={`${flashRate}%`} label="Флеш" color="#f59e0b" />
      ) : (
        <StatCard value={flashCount} label="Флеш" color="#f59e0b" />
      )}
      {rating !== null ? (
        <StatCard value={`★ ${rating}`} label="Рейтинг" color="#a78bfa" />
      ) : (
        <StatCard
          value="—"
          label="Рейтинг"
          color={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
        />
      )}
    </View>
  );
}

