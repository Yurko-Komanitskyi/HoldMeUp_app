import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle, Timer, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import {
  ASCENT_TYPE_META,
  FEELING_ICONS,
  normalizeAscentTypeMetaKey,
} from '@/entities/ascent/lib/constants';
import { pickLocalizedString } from '@/entities/ascent/lib/feed-localized';
import type { AscentFeedItem } from '@/entities/ascent/model/ascent';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { AscentReactionsBar } from '@/entities/ascent/ui/ascent-reactions-bar';
import { useUserStore } from '@/entities/user/model/userStore';
import { ACCENT } from '@/shared/config/palette';

export interface AscentFeedCardProps {
  item: AscentFeedItem;
}

export function AscentFeedCard({ item }: AscentFeedCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const myId = useUserStore((s) => s.currentUser?.id);

  const metaKey = normalizeAscentTypeMetaKey(item.type);
  const meta = ASCENT_TYPE_META[metaKey];

  const timeRaw = pickLocalizedString(item.timeSeconds, i18n.language);
  const timeNum = timeRaw != null && /^\d+$/.test(timeRaw) ? parseInt(timeRaw, 10) : null;
  const timeLabel =
    timeNum != null && !Number.isNaN(timeNum)
      ? `${Math.floor(timeNum / 60)}:${String(timeNum % 60).padStart(2, '0')}`
      : timeRaw;

  const routeName =
    pickLocalizedString(item.routeName, i18n.language)?.trim() ||
    `#${item.routeId.slice(-6)}`;
  const grade = pickLocalizedString(item.routeGrade, i18n.language);
  const feelingRaw = pickLocalizedString(item.feeling, i18n.language);
  const feelingNum =
    feelingRaw != null && /^\d+$/.test(feelingRaw) ? parseInt(feelingRaw, 10) : null;
  const feelingMeta =
    feelingNum != null && FEELING_ICONS[feelingNum] ? FEELING_ICONS[feelingNum] : null;

  const goUser = React.useCallback(() => {
    if (!item.userId) return;
    if (myId && item.userId === myId) {
      router.push('/(tabs)/profile' as never);
      return;
    }
    router.push(`/user/${item.userId}` as never);
  }, [item.userId, myId, router]);

  const goDetail = React.useCallback(() => {
    router.push(`/ascent-detail/${item.id}` as never);
  }, [item.id, router]);

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
      }}>
      <Pressable
        onPress={goUser}
        style={{ marginBottom: 8 }}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={t('ascent.feedAuthorHint')}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: ACCENT }}>
          {t('ascent.feedAuthorHint')}
        </Text>
      </Pressable>

      <Pressable
        onPress={goDetail}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
        accessibilityRole="button">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: item.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            as={item.success ? CheckCircle2 : XCircle}
            size={18}
            color={item.success ? colors.chart2 : colors.destructive}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}
            numberOfLines={2}>
            {routeName}
          </Text>
          {grade ? (
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}>
              {grade}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 8,
            }}>
            <View
              style={{
                backgroundColor: meta.color + '18',
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: meta.color }}>
                {t(`logAscent.ascentTypeLabel.${metaKey}`)}
              </Text>
            </View>
            {timeLabel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Timer size={11} color={colors.mutedForeground} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{timeLabel}</Text>
              </View>
            ) : null}
            {feelingMeta ? <Icon as={feelingMeta.icon} size={13} color={feelingMeta.color} /> : null}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            {new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
          </Text>
          <ChevronRight size={14} color={colors.mutedForeground} />
        </View>
      </Pressable>

      <AscentReactionsBar
        ascentId={item.id}
        reactions={item.reactions ?? []}
        ascentOwnerId={item.userId}
        currentUserId={myId}
        compact
      />
    </View>
  );
}
