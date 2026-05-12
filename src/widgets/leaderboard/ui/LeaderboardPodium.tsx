import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { ACCENT } from '@/shared/config/palette';
import { Text } from '@/shared/ui/text';
import type { LeaderboardEntry } from '@/entities/leaderboard/model/types';
import { initialsInCircleTextStyle } from '../lib/initialsInCircleTextStyle';

// [1st, 2nd, 3rd] — висоти білих постаментів (3-й був занадто низький і зникав під карткою списку)
const STAGE_HEIGHTS = [132, 96, 80] as const;
const AVATAR_SIZES = [76, 60, 60] as const;
const FADE_DELAYS = [80, 0, 160] as const;
const AVATAR_OVERLAP = 18;

function getInitials(e: LeaderboardEntry): string {
  if (e.firstName && e.lastName) return `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
  return (e.userTag ?? '?').slice(0, 2).toUpperCase();
}

function getName(e: LeaderboardEntry): string {
  return [e.firstName, e.lastName].filter(Boolean).join(' ') || e.userTag || '?';
}

function PodiumColumn({
  entry,
  position,
  onPress,
}: {
  entry: LeaderboardEntry;
  position: 0 | 1 | 2;
  onPress?: () => void;
}) {
  const isFirst = position === 0;
  const avatarSize = AVATAR_SIZES[position];
  const stageTarget = STAGE_HEIGHTS[position];
  const fadeDelay = FADE_DELAYS[position];

  const stageH = useSharedValue(0);
  React.useEffect(() => {
    stageH.value = withDelay(
      fadeDelay + 280,
      withSpring(stageTarget, { damping: 13, stiffness: 72 }),
    );
  }, []);
  const stageStyle = useAnimatedStyle(() => ({ height: stageH.value }));

  const avatarR = avatarSize / 2;

  return (
    <Animated.View
      entering={FadeInDown.delay(fadeDelay).springify().damping(18).stiffness(130)}
      style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          alignItems: 'center',
          width: '100%',
          opacity: pressed ? 0.78 : 1,
          zIndex: 2,
          marginBottom: -AVATAR_OVERLAP,
        })}
      >
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarR,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: entry.isCurrentUser ? 3 : 2,
            borderColor: entry.isCurrentUser ? ACCENT : 'rgba(255,255,255,0.85)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.16,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text style={initialsInCircleTextStyle(isFirst ? 25 : 19, ACCENT, '900')}>
            {getInitials(entry)}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={{
            fontSize: isFirst ? 13 : 12,
            fontWeight: '800',
            color: '#fff',
            marginTop: 10,
            paddingHorizontal: 2,
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {getName(entry)}
        </Text>

        <View
          style={{
            marginTop: 5,
            marginBottom: AVATAR_OVERLAP + 6,
            alignSelf: 'center',
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderRadius: 20,
            paddingHorizontal: 11,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: isFirst ? 13 : 11, fontWeight: '800', color: ACCENT, textAlign: 'center' }}>
            {entry.score.totalPoints.toLocaleString()} балів
          </Text>
        </View>
      </Pressable>

      <Animated.View
        style={[
          {
            width: '100%',
            maxWidth: isFirst ? 112 : 100,
            alignSelf: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
            paddingTop: AVATAR_OVERLAP + 2,
          },
          stageStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: isFirst ? 30 : 22,
              fontWeight: '900',
              color: ACCENT + 'CC',
              lineHeight: isFirst ? 34 : 26,
              textAlign: 'center',
              ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
            }}
          >
            {position + 1}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function PodiumSlot({
  children,
  flex = 1,
}: {
  children?: React.ReactNode;
  flex?: number;
}) {
  return (
    <View
      style={{
        flex,
        minWidth: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </View>
  );
}

export function LeaderboardPodium({
  top3,
  onPressEntry,
}: {
  top3: LeaderboardEntry[];
  onPressEntry?: (userId: string) => void;
}) {
  const [first, second, third] = top3;
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, minHeight: 288 }}>
        {second ? (
          <PodiumSlot>
            <PodiumColumn entry={second} position={1} onPress={() => onPressEntry?.(second.userId)} />
          </PodiumSlot>
        ) : (
          <PodiumSlot />
        )}
        {first ? (
          <PodiumSlot flex={1.12}>
            <PodiumColumn entry={first} position={0} onPress={() => onPressEntry?.(first.userId)} />
          </PodiumSlot>
        ) : (
          <PodiumSlot flex={1.12} />
        )}
        {third ? (
          <PodiumSlot>
            <PodiumColumn entry={third} position={2} onPress={() => onPressEntry?.(third.userId)} />
          </PodiumSlot>
        ) : (
          <PodiumSlot />
        )}
      </View>
    </View>
  );
}
