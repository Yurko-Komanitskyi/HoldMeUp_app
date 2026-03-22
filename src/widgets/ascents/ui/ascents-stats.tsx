import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TrendingUp, Zap, Target, Award } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { BarChart } from 'react-native-gifted-charts';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/constants';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { AscentType } from '@/entities/ascent/model/ascent';
import type { AscentStatsResponse } from '@/entities/stats/api/types';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

const TYPE_ORDER: AscentType[] = [
  AscentType.FLASH,
  AscentType.ON_SIGHT,
  AscentType.REDPOINT,
  AscentType.TOP,
  AscentType.PROJECT,
];

function ascentTypeLabelKey(
  type: AscentType
): 'FLASH' | 'ONSIGHT' | 'REDPOINT' | 'TOP' | 'PROJECT' {
  if (type === AscentType.ON_SIGHT) return 'ONSIGHT';
  return type as 'FLASH' | 'REDPOINT' | 'TOP' | 'PROJECT';
}

function typeAccentColor(type: AscentType, fallback: string): string {
  const key = ascentTypeLabelKey(type);
  if (key === 'TOP') return '#a855f7';
  if (key === 'PROJECT') return '#6366f1';
  return ASCENT_TYPE_META[key]?.color ?? fallback;
}

interface AscentsStatsProps {
  statsResponse: AscentStatsResponse | undefined;
  isLoading?: boolean;
  statsQueryError?: unknown;
  onRetryStats?: () => void;
}

function toDisplayableStat(value: unknown): string | number {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null) {
    const o = value as Record<string, unknown>;
    if (typeof o.label === 'string') return o.label;
    if (typeof o.value === 'string' || typeof o.value === 'number') return o.value;
  }
  return '—';
}

export function AscentsStats({
  statsResponse,
  isLoading,
  statsQueryError,
  onRetryStats,
}: AscentsStatsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { width: screenWidth } = useWindowDimensions();

  if (statsQueryError != null && onRetryStats) {
    return (
      <QueryErrorPanel variant="compact" error={statsQueryError} onRetry={onRetryStats} />
    );
  }

  const cardBg = colors.card;
  const borderColor = colors.border;
  const labelColor = colors.mutedForeground;
  const chartWidth = screenWidth - 64;

  const current = statsResponse?.current;
  const total = current?.totalAscents ?? 0;
  const successCount = current?.successfulAscents ?? 0;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  const flashCount = current?.byType?.[AscentType.FLASH] ?? 0;
  const maxGradeLabel = toDisplayableStat(current?.maxGrade);

  const weekdaysShort = t('common.weekdaysShort', { returnObjects: true }) as string[];

  const weeklyData = React.useMemo(() => {
    const daily = statsResponse?.dailyCounts ?? [];
    return daily.map((dc) => {
      const [y, m, d] = dc.date.split('-').map(Number);
      const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
      const label = weekdaysShort[utc.getUTCDay()];
      return {
        value: dc.count,
        label,
        frontColor: dc.count > 0 ? ACCENT : colors.muted,
      };
    });
  }, [statsResponse?.dailyCounts, colors.muted, weekdaysShort]);

  const STAT_CARDS = [
    {
      key: 'total',
      icon: TrendingUp,
      value: isLoading ? '…' : total,
      label: t('ascents.statTotal'),
      color: ACCENT,
    },
    {
      key: 'success',
      icon: Target,
      value: isLoading ? '…' : `${successRate}%`,
      label: t('ascents.statSuccess'),
      color: colors.chart2,
    },
    {
      key: 'flash',
      icon: Zap,
      value: isLoading ? '…' : flashCount,
      label: t('ascents.statFlash'),
      color: colors.chart4,
    },
    {
      key: 'max',
      icon: Award,
      value: isLoading ? '…' : maxGradeLabel,
      label: t('ascents.statMax'),
      color: colors.chart5,
    },
  ] as const;

  const maxBar = Math.max(4, ...weeklyData.map((d) => d.value), 1);

  return (
    <>
      {/* Stats grid */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {STAT_CARDS.map((s) => (
          <View
            key={s.key}
            style={{
              flex: 1,
              backgroundColor: s.color + '15',
              borderRadius: 16,
              padding: 12,
              alignItems: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: s.color + '30',
            }}>
            <Icon as={s.icon} size={16} color={s.color} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: s.color, letterSpacing: -0.5 }}>
              {s.value}
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, fontWeight: '600' }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Weekly activity chart */}
      <View
        style={{
          backgroundColor: cardBg,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>
            {t('ascents.weeklyActivity')}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {isLoading ? '…' : total} {t('ascents.periodCount')}
          </Text>
        </View>
        {weeklyData.length > 0 ? (
          <BarChart
            data={weeklyData}
            barWidth={Math.floor((chartWidth - 48) / Math.max(weeklyData.length, 1)) - 4}
            spacing={4}
            barBorderRadius={8}
            noOfSections={4}
            maxValue={maxBar}
            width={chartWidth}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={borderColor}
            yAxisTextStyle={{ color: labelColor, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: labelColor, fontSize: 11 }}
            rulesColor={borderColor}
            isAnimated
          />
        ) : (
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {isLoading ? '…' : t('ascents.statsNoChart')}
          </Text>
        )}
      </View>

      {/* Type breakdown */}
      <View
        style={{
          backgroundColor: cardBg,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor,
        }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: colors.foreground,
            marginBottom: 14,
          }}>
          {t('ascents.typeBreakdown')}
        </Text>
        <View style={{ gap: 10 }}>
          {TYPE_ORDER.map((type) => {
            const count = current?.byType?.[type] ?? 0;
            const pct = total > 0 ? count / total : 0;
            const metaColor = typeAccentColor(type, colors.mutedForeground);
            const labelKey = ascentTypeLabelKey(type);
            return (
              <View key={type} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: metaColor }}>
                    {t(`logAscent.ascentTypeLabel.${labelKey}`)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {isLoading ? '…' : count}
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: borderColor,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.round(pct * 100)}%`,
                      backgroundColor: metaColor,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </>
  );
}
