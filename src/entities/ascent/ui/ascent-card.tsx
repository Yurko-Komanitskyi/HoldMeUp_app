import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, XCircle, Timer, ChevronRight } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import {
  ASCENT_TYPE_META,
  FEELING_ICONS,
  normalizeAscentTypeMetaKey,
} from '@/entities/ascent/lib/constants';
import { useTranslation } from 'react-i18next';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export type AscentCardVariant = 'compact' | 'detailed';

export interface AscentCardProps {
  ascent: Ascent;
  variant?: AscentCardVariant;
}

export function AscentCard({ ascent, variant = 'detailed' }: AscentCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const compact = variant === 'compact';

  const metaKey = normalizeAscentTypeMetaKey(ascent.type);
  const meta = ASCENT_TYPE_META[metaKey];
  const feelingMeta = !compact && ascent.feeling != null ? FEELING_ICONS[ascent.feeling] : null;

  const timeLabel =
    ascent.timeSeconds != null
      ? `${Math.floor(ascent.timeSeconds / 60)}:${String(ascent.timeSeconds % 60).padStart(2, '0')}`
      : null;

  const title = ascent.routeName?.trim() || t('logAscent.missingRoute');

  const onPress = () => router.push(`/ascent-detail/${ascent.id}` as never);

  const iconSize = compact ? 18 : 20;
  const avatar = compact ? 38 : 42;
  const avatarRadius = compact ? 12 : 13;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        marginBottom: compact ? 0 : 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingVertical: compact ? 12 : 13,
      }}>
      <View
        style={{
          width: avatar,
          height: avatar,
          borderRadius: avatarRadius,
          backgroundColor: ascent.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon
          as={ascent.success ? CheckCircle2 : XCircle}
          size={iconSize}
          color={ascent.success ? colors.chart2 : colors.destructive}
        />
      </View>

      <View style={{ flex: 1, gap: compact ? 0 : 4 }}>
        <Text
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: '600',
            color: colors.foreground,
          }}
          numberOfLines={1}>
          {title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: compact ? 3 : 0,
          }}>
          <View
            style={{
              backgroundColor: compact ? meta.color + '18' : meta.bg,
              borderRadius: compact ? 5 : 6,
              paddingHorizontal: compact ? 6 : 7,
              paddingVertical: 2,
            }}>
            <Text
              style={{
                fontSize: compact ? 10 : 11,
                fontWeight: '700',
                color: meta.color,
              }}>
              {t(`logAscent.ascentTypeLabel.${metaKey}`)}
            </Text>
          </View>
          {timeLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Timer size={10} color={colors.mutedForeground} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{timeLabel}</Text>
            </View>
          )}
          {feelingMeta && (
            <Icon as={feelingMeta.icon} size={13} color={feelingMeta.color} />
          )}
        </View>
      </View>

      {compact ? (
        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
          {new Date(ascent.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
        </Text>
      ) : (
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            {new Date(ascent.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
          </Text>
          <ChevronRight size={14} color={colors.mutedForeground} />
        </View>
      )}
    </TouchableOpacity>
  );
}
