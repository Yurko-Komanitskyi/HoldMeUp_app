import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  XCircle,
  Timer,
  Zap,
  Eye,
  Circle,
  Target,
  Flag,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import {
  ASCENT_TYPE_META,
  FEELING_ICONS,
  normalizeAscentTypeMetaKey,
  type AscentTypeMetaKey,
} from '@/entities/ascent/lib/constants';
import { pickLocalizedString } from '@/entities/ascent/lib/feed-localized';
import type { AscentFeedItem } from '@/entities/ascent/model/ascent';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { AscentReactionsBar } from '@/entities/ascent/ui/ascent-reactions-bar';
import { useUserStore } from '@/entities/user/model/userStore';

const TYPE_ICON_MAP: Record<
  AscentTypeMetaKey,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  FLASH: Zap,
  ONSIGHT: Eye,
  REDPOINT: Circle,
  TOP: Target,
  PROJECT: Flag,
};

function formatRelativeTime(dateStr: string, lang: string): string {
  const diff = Date.now() - Date.parse(dateStr);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return lang === 'ua' ? 'щойно' : 'just now';
  if (minutes < 60) return lang === 'ua' ? `${minutes} хв` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'ua' ? `${hours} г` : `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return lang === 'ua' ? `${days} д` : `${days}d`;
  return new Date(dateStr).toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', {
    day: '2-digit',
    month: 'short',
  });
}

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
  const TypeIcon = TYPE_ICON_MAP[metaKey];

  const timeRaw = pickLocalizedString(item.timeSeconds, i18n.language);
  const timeNum = timeRaw != null && /^\d+$/.test(timeRaw) ? parseInt(timeRaw, 10) : null;
  const timeLabel =
    timeNum != null && !Number.isNaN(timeNum)
      ? `${Math.floor(timeNum / 60)}:${String(timeNum % 60).padStart(2, '0')}`
      : timeRaw;

  const routeName =
    pickLocalizedString(item.routeName, i18n.language)?.trim() || `#${item.routeId.slice(-6)}`;
  const grade = pickLocalizedString(item.routeGrade, i18n.language);
  const notes = pickLocalizedString(item.notes, i18n.language);

  const feelingRaw = pickLocalizedString(item.feeling, i18n.language);
  const feelingNum =
    feelingRaw != null && /^\d+$/.test(feelingRaw) ? parseInt(feelingRaw, 10) : null;
  const feelingMeta =
    feelingNum != null && FEELING_ICONS[feelingNum] ? FEELING_ICONS[feelingNum] : null;

  const authorName = React.useMemo(() => {
    if (item.userFirstName || item.userLastName) {
      return [item.userFirstName, item.userLastName].filter(Boolean).join(' ');
    }
    if (item.userTag) return `@${item.userTag}`;
    return t('common.unknown');
  }, [item.userFirstName, item.userLastName, item.userTag, t]);

  const initials = authorName
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0] ?? '')
    .join('')
    .toUpperCase();

  const relativeTime = formatRelativeTime(item.date, i18n.language);

  const hasMeta = !!(timeLabel || feelingMeta || notes);

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
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: colors.card,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
      }}>

      {/* Left accent strip */}
      <View style={{ width: 4, backgroundColor: meta.color }} />

      <View style={{ flex: 1 }}>
        {/* Main content — tappable for detail except author */}
        <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, gap: 5 }}>

          {/* Row 1: Avatar + Name + Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={goUser}
              hitSlop={6}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: meta.color + '28',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: meta.color }}>
                  {initials}
                </Text>
              </View>
              <Text
                style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}
                numberOfLines={1}>
                {authorName}
              </Text>
            </Pressable>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, flexShrink: 0 }}>
              {relativeTime}
            </Text>
          </View>

          {/* Row 2: Type pill + Route name + Grade + Success */}
          <Pressable
            onPress={goDetail}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
            {/* Type pill */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                backgroundColor: meta.color + '1E',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                flexShrink: 0,
              }}>
              <TypeIcon size={10} color={meta.color} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: meta.color }}>
                {t(`logAscent.ascentTypeLabel.${metaKey}`)}
              </Text>
            </View>

            {/* Route name */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.foreground,
                flex: 1,
              }}
              numberOfLines={1}>
              {routeName}
            </Text>

            {/* Grade */}
            {grade ? (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '800',
                  color: meta.color,
                  flexShrink: 0,
                }}>
                {grade}
              </Text>
            ) : null}

            {/* Success */}
            <Icon
              as={item.success ? CheckCircle2 : XCircle}
              size={14}
              color={item.success ? '#22c55e' : colors.destructive}
            />
          </Pressable>

          {/* Row 3: Time + Feeling + Notes (only if any) */}
          {hasMeta ? (
            <Pressable
              onPress={goDetail}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 1 }}>
              {timeLabel ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Timer size={11} color={colors.mutedForeground} />
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{timeLabel}</Text>
                </View>
              ) : null}
              {feelingMeta ? (
                <Icon as={feelingMeta.icon} size={14} color={feelingMeta.color} />
              ) : null}
              {notes ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.mutedForeground,
                    fontStyle: 'italic',
                    flex: 1,
                  }}
                  numberOfLines={1}>
                  "{notes}"
                </Text>
              ) : null}
            </Pressable>
          ) : null}
        </View>

        {/* Reactions */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border + '70',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}>
          <AscentReactionsBar
            ascentId={item.id}
            reactions={item.reactions ?? []}
            ascentOwnerId={item.userId}
            currentUserId={myId}
            compact
          />
        </View>
      </View>
    </View>
  );
}
