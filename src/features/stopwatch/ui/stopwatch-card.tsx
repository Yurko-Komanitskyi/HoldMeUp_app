import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { type StopwatchState, type StopwatchActions, formatStopwatch } from '@/features/stopwatch/model/useStopwatch';
import { ACCENT } from '@/shared/config/palette';

type StopwatchCardProps = StopwatchState & StopwatchActions;

export function StopwatchCard({ seconds, running, saved, start, pause, reset }: StopwatchCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg     = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const timeColor = running ? '#22c55e' : saved ? ACCENT : (isDark ? '#fff' : '#000');

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <Timer size={11} color="rgba(128,128,128,0.55)" />
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: 'rgba(128,128,128,0.55)' }}>
            СЕКУНДОМІР
          </Text>
        </View>
        <Text
          style={{
            fontSize: 42,
            fontWeight: '200',
            letterSpacing: -1,
            color: timeColor,
            fontVariant: ['tabular-nums'],
            lineHeight: 50,
          }}>
          {formatStopwatch(seconds)}
        </Text>
        {saved && seconds > 0 && (
          <Text style={{ fontSize: 11, color: '#22c55e', fontWeight: '600', marginTop: 2 }}>
            ✓ Зафіксовано
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {!running ? (
          <TouchableOpacity
            onPress={start}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={pause}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
            <Pause size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={reset}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 1,
            borderColor,
            backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RotateCcw size={18} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
