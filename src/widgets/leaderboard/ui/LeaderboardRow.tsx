import * as React from 'react';
import { View } from 'react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import type { LeaderboardEntry } from '@/entities/leaderboard/model/types';

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const colors = useThemeColor();
  const rankColor = RANK_COLORS[entry.rank] ?? colors.mutedForeground;
  const isHighlighted = entry.isCurrentUser;

  const name =
    [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.userTag || '?';
  const initials =
    entry.firstName && entry.lastName
      ? `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase()
      : (entry.userTag ?? '?').slice(0, 2).toUpperCase();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: isHighlighted ? ACCENT + '10' : 'transparent',
        gap: 12,
      }}>
      {/* Rank */}
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: rankColor }}>
          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
        </Text>
      </View>

      {/* Avatar */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isHighlighted ? ACCENT + '22' : colors.muted,
          borderWidth: isHighlighted ? 2 : 1,
          borderColor: isHighlighted ? ACCENT : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '800',
            color: isHighlighted ? ACCENT : colors.mutedForeground,
          }}>
          {initials}
        </Text>
      </View>

      {/* Name + tag */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: isHighlighted ? '800' : '600',
            color: isHighlighted ? ACCENT : colors.foreground,
          }}>
          {name}
          {isHighlighted ? '  (ти)' : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
          {entry.score.maxGrade ? (
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: '600' }}>
              max {entry.score.maxGrade}
            </Text>
          ) : null}
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            {entry.score.uniqueRoutes} маршр.
          </Text>
        </View>
      </View>

      {/* Points */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '800',
            color: isHighlighted ? ACCENT : colors.foreground,
          }}>
          {entry.score.totalPoints.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontWeight: '500' }}>
          pts
        </Text>
      </View>
    </View>
  );
}
