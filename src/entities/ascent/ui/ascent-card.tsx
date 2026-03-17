import * as React from 'react';
import { View } from 'react-native';
import { CheckCircle2, XCircle, Timer, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ASCENT_TYPE_META, FEELING_ICONS } from '@/entities/ascent/lib/constants';
import type { Ascent } from '@/entities/ascent/model/ascent';

interface AscentCardProps {
  ascent: Ascent;
}

export function AscentCard({ ascent }: AscentCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const meta = ASCENT_TYPE_META[ascent.type?.toUpperCase()] ?? ASCENT_TYPE_META.REPEAT;
  const feelingMeta = ascent.feeling != null ? FEELING_ICONS[ascent.feeling] : null;

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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        backgroundColor: isDark ? '#1c1c1e' : '#fff',
        paddingHorizontal: 14,
        paddingVertical: 13,
      }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: ascent.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon
          as={ascent.success ? CheckCircle2 : XCircle}
          size={20}
          color={ascent.success ? '#22c55e' : '#ef4444'}
        />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#fff' : '#000' }}
          numberOfLines={1}>
          #{ascent.routeId.slice(-6)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              backgroundColor: meta.bg,
              borderRadius: 6,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: meta.color }}>{meta.label}</Text>
          </View>
          {timeLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Timer size={10} color="rgba(128,128,128,0.6)" />
              <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.7)' }}>{timeLabel}</Text>
            </View>
          )}
          {feelingMeta && <feelingMeta.icon size={13} color={feelingMeta.color} />}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.7)' }}>
          {new Date(ascent.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
        </Text>
        <ChevronRight size={14} color="rgba(128,128,128,0.4)" />
      </View>
    </View>
  );
}
