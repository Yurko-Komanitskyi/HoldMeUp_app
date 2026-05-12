import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import type { LeaderboardEntry } from '@/entities/leaderboard/model/types';
import { initialsInCircleTextStyle } from '../lib/initialsInCircleTextStyle';

export function LeaderboardRow({
  entry,
  index = 0,
  onPress,
  leaderPoints: _leaderPoints,
}: {
  entry: LeaderboardEntry;
  index?: number;
  onPress?: () => void;
  leaderPoints?: number;
}) {
  const colors = useThemeColor();
  const me = entry.isCurrentUser;
  const nameColor = colors.isDark ? ACCENT : colors.chart1;

  const name =
    [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.userTag || '?';
  const initials =
    entry.firstName && entry.lastName
      ? `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase()
      : (entry.userTag ?? '?').slice(0, 2).toUpperCase();

  const rankStr = String(entry.rank).padStart(2, '0');
  const avatarSize = 46;
  const avatarR = avatarSize / 2;

  return (
    <Animated.View
      entering={FadeInUp.delay(Math.min(index * 55, 330)).springify().damping(20).stiffness(150)}
      style={{ width: '100%', alignSelf: 'stretch' }}
    >
      <Pressable onPress={onPress} style={({ pressed }) => ({ width: '100%', opacity: pressed ? 0.75 : 1 })}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            width: '100%',
            paddingVertical: 14,
            paddingLeft: 18,
            paddingRight: 16,
            gap: 12,
            backgroundColor: me ? ACCENT + '0D' : colors.background,
            borderLeftWidth: me ? 3 : 0,
            borderLeftColor: me ? ACCENT : 'transparent',
          }}
        >
          <Text
            style={{
              width: 34,
              flexShrink: 0,
              fontSize: 15,
              fontWeight: '900',
              color: colors.foreground,
              textAlign: 'left',
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.3,
            }}
          >
            {rankStr}
          </Text>

          <View
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarR,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text style={initialsInCircleTextStyle(15, colors.primary, '800')}>
              {initials}
            </Text>
          </View>

          <View
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0,
              minWidth: 0,
              justifyContent: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: nameColor,
                  flexShrink: 1,
                }}
              >
                {name}
              </Text>
              {me ? (
                <View
                  style={{
                    backgroundColor: ACCENT,
                    borderRadius: 5,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.4 }}>
                    ТИ
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: colors.mutedForeground,
                marginTop: 3,
              }}
            >
              {entry.score.totalPoints.toLocaleString()} балів
            </Text>
          </View>
        </View>
      </Pressable>

      <View
        style={{
          height: StyleSheet.hairlineWidth,
          marginLeft: 18,
          backgroundColor: colors.border,
          opacity: 0.85,
        }}
      />
    </Animated.View>
  );
}
