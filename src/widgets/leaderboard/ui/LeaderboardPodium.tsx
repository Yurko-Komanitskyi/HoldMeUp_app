import * as React from 'react';
import { View } from 'react-native';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import type { LeaderboardEntry } from '@/entities/leaderboard/model/types';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] as const;
const PODIUM_HEIGHTS = [88, 64, 52] as const;

function PodiumBlock({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 0 | 1 | 2;
}) {
  const colors = useThemeColor();
  const medalColor = MEDAL_COLORS[position];
  const podiumH = PODIUM_HEIGHTS[position];
  const isCenter = position === 0;

  const name = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.userTag || '?';
  const initials =
    entry.firstName && entry.lastName
      ? `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase()
      : (entry.userTag ?? '?').slice(0, 2).toUpperCase();

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      {/* Crown / medal */}
      <Text style={{ fontSize: isCenter ? 22 : 16, marginBottom: 4 }}>
        {position === 0 ? '👑' : position === 1 ? '🥈' : '🥉'}
      </Text>

      {/* Avatar */}
      <View
        style={{
          width: isCenter ? 60 : 48,
          height: isCenter ? 60 : 48,
          borderRadius: isCenter ? 30 : 24,
          backgroundColor: entry.isCurrentUser ? ACCENT + '33' : colors.muted,
          borderWidth: 3,
          borderColor: medalColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}>
        <Text
          style={{
            fontSize: isCenter ? 18 : 14,
            fontWeight: '800',
            color: entry.isCurrentUser ? ACCENT : colors.foreground,
          }}>
          {initials}
        </Text>
      </View>

      {/* Name */}
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          fontWeight: entry.isCurrentUser ? '800' : '600',
          color: entry.isCurrentUser ? ACCENT : colors.foreground,
          maxWidth: 80,
          textAlign: 'center',
          marginBottom: 2,
        }}>
        {name}
      </Text>

      {/* Points */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: medalColor,
          marginBottom: 4,
        }}>
        {entry.score.totalPoints.toLocaleString()} pts
      </Text>

      {/* Podium base */}
      <View
        style={{
          width: '90%',
          height: podiumH,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: medalColor + '28',
          borderWidth: 1,
          borderColor: medalColor + '55',
          borderBottomWidth: 0,
          alignItems: 'center',
          paddingTop: 8,
        }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: medalColor }}>
          {entry.rank}
        </Text>
      </View>
    </View>
  );
}

export function LeaderboardPodium({ top3 }: { top3: LeaderboardEntry[] }) {
  const colors = useThemeColor();
  const [first, second, third] = top3;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingTop: 16,
        paddingHorizontal: 8,
        overflow: 'hidden',
      }}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: '700',
          color: colors.mutedForeground,
          letterSpacing: 1,
          marginBottom: 16,
        }}>
        ТОП-3 СКАЛОДРОМИ
      </Text>

      {/* Re-order: 2nd | 1st | 3rd for classic podium look */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {second ? <PodiumBlock entry={second} position={1} /> : <View style={{ flex: 1 }} />}
        {first  ? <PodiumBlock entry={first}  position={0} /> : <View style={{ flex: 1 }} />}
        {third  ? <PodiumBlock entry={third}  position={2} /> : <View style={{ flex: 1 }} />}
      </View>
    </View>
  );
}
