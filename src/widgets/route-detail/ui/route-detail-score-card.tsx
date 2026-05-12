import * as React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { ACCENT } from '@/shared/config/palette';
import { Text } from '@/shared/ui/text';
import {
  ASCENT_MULTIPLIERS,
  GRADE_POINTS,
} from '@/entities/leaderboard/lib/scoring';
import { AscentType } from '@/entities/ascent/model/ascent';

const ROWS: {
  type: AscentType;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { type: AscentType.ON_SIGHT, label: 'On-sight', emoji: '👁',  color: '#a855f7' },
  { type: AscentType.FLASH,    label: 'Flash',     emoji: '⚡', color: ACCENT },
  { type: AscentType.REDPOINT, label: 'Redpoint',  emoji: '🔄', color: '#22c55e' },
  { type: AscentType.TOP,      label: 'Top',       emoji: '✋', color: '#f97316' },
];

export function RouteDetailScoreCard({ grade }: { grade: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const basePoints = GRADE_POINTS[grade] ?? null;
  if (!basePoints) return null;

  const maxPoints = Math.round(basePoints * ASCENT_MULTIPLIERS[AscentType.ON_SIGHT]);

  const cardBg  = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const muted   = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.4)';

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: cardBg,
          overflow: 'hidden',
        }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: border,
            gap: 8,
          }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: muted, flex: 1, letterSpacing: 0.8 }}>
            БАЛИ ЗА ПРОЛІЗАННЯ
          </Text>
          <View
            style={{
              backgroundColor: ACCENT + '22',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <Text style={{ fontSize: 13, fontWeight: '900', color: ACCENT }}>
              {grade}  ·  до {maxPoints} pts
            </Text>
          </View>
        </View>

        {/* Rows */}
        {ROWS.map(({ type, label, emoji, color }, i) => {
          const pts = Math.round(basePoints * ASCENT_MULTIPLIERS[type]);
          const ratio = pts / maxPoints;
          const isLast = i === ROWS.length - 1;
          return (
            <View
              key={type}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: border,
                gap: 10,
              }}>
              <Text style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{emoji}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: muted, width: 72 }}>
                {label}
              </Text>
              {/* Progress bar */}
              <View
                style={{
                  flex: 1,
                  height: 5,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    height: 5,
                    width: `${ratio * 100}%`,
                    backgroundColor: color,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color, width: 62, textAlign: 'right' }}>
                {pts.toLocaleString()} pts
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
