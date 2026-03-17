import * as React from 'react';
import { View } from 'react-native';
import { CheckCircle2, XCircle, Timer } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/constants';
import type { Ascent } from '@/entities/ascent/model/ascent';

export interface RecentAscentRowProps {
  ascent: Ascent;
}

export function RecentAscentRow({ ascent }: RecentAscentRowProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  const meta = ASCENT_TYPE_META[ascent.type?.toUpperCase()] ?? ASCENT_TYPE_META.REPEAT;
  const timeLabel =
    ascent.timeSeconds != null
      ? `${Math.floor(ascent.timeSeconds / 60)}:${String(ascent.timeSeconds % 60).padStart(2, '0')}`
      : null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: cardBg,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor,
      }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: ascent.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon
          as={ascent.success ? CheckCircle2 : XCircle}
          size={18}
          color={ascent.success ? '#22c55e' : '#ef4444'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#fff' : '#000' }}
          numberOfLines={1}>
          #{ascent.routeId.slice(-6)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <View
            style={{
              backgroundColor: meta.color + '18',
              borderRadius: 5,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: meta.color }}>{meta.label}</Text>
          </View>
          {timeLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Timer size={10} color="rgba(128,128,128,0.5)" />
              <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)' }}>{timeLabel}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.55)' }}>
        {new Date(ascent.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
      </Text>
    </View>
  );
}
