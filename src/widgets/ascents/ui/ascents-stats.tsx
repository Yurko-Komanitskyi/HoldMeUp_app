import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { TrendingUp, Zap, Target, Award } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ASCENT_TYPE_META, GRADE_MAP } from '@/entities/ascent/lib/constants';
import { ACCENT } from '@/shared/config/palette';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { computeAscentsStats } from '@/entities/ascent/model/ascent-stats';

interface AscentsStatsProps {
  ascents: Ascent[];
}

export function AscentsStats({ ascents }: AscentsStatsProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  const cardBg = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const chartWidth = screenWidth - 64;

  const stats = React.useMemo(() => computeAscentsStats(ascents), [ascents]);

  const getAscentDateISO = React.useCallback((dateLike: unknown): string | null => {
    if (!dateLike) return null;
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike as any);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }, []);

  const typeCounts = React.useMemo(
    () =>
      (['FLASH', 'ONSIGHT', 'REDPOINT', 'REPEAT'] as const).map((type) => ({
        type,
        count: ascents.filter((a) => a.type?.toUpperCase() === type).length,
        meta: ASCENT_TYPE_META[type],
      })),
    [ascents]
  );

  const weeklyData = React.useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        label: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()],
      };
    });
    return days.map((day) => {
      const count = ascents.filter((a) => {
        const iso = getAscentDateISO(a.date);
        return iso ? iso.split('T')[0] === day.dateStr : false;
      }).length;
      return {
        value: count,
        label: day.label,
        frontColor: count > 0 ? ACCENT : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      };
    });
  }, [ascents, isDark]);

  // Динамічний розрахунок максимального грейду за останні 6 місяців
  const { progressData, progressLabels } = React.useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        monthStr: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString('uk-UA', { month: 'short' }).replace('.', ''),
      };
    });
    const data = months.map((m) => {
      const monthAscents = ascents.filter((a) => {
        const iso = getAscentDateISO(a.date);
        return iso ? iso.slice(0, 7) === m.monthStr && a.success : false;
      });
      const maxVal = monthAscents.reduce((max, a) => {
        const val = GRADE_MAP[(a as any).route?.grade ?? ''] ?? 0;
        return val > max ? val : max;
      }, 0);
      return { value: maxVal };
    });
    return { progressData: data, progressLabels: months.map((m) => m.label) };
  }, [ascents]);

  const STAT_CARDS = [
    { icon: TrendingUp, value: stats.total, label: t('ascents.statTotal'), color: ACCENT },
    {
      icon: Target,
      value: `${stats.successRate}%`,
      label: t('ascents.statSuccess'),
      color: '#22c55e',
    },
    { icon: Zap, value: stats.flash, label: t('ascents.statFlash'), color: '#eab308' },
    { icon: Award, value: stats.maxGradeLabel, label: t('ascents.statMax'), color: '#a855f7' },
  ] as const;

  return (
    <>
      {/* Stats grid */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {STAT_CARDS.map((s) => (
          <View
            key={s.label}
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
            <Text style={{ fontSize: 10, color: 'rgba(128,128,128,0.7)', fontWeight: '600' }}>
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
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {t('ascents.weeklyActivity')}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)' }}>
            {stats.total} {t('ascents.periodCount')}
          </Text>
        </View>
        <BarChart
          data={weeklyData}
          barWidth={Math.floor((chartWidth - 48) / 7) - 4}
          spacing={4}
          barBorderRadius={8}
          noOfSections={4}
          maxValue={Math.max(4, ...weeklyData.map((d) => d.value))}
          width={chartWidth}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={borderColor}
          yAxisTextStyle={{ color: labelColor, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: labelColor, fontSize: 11 }}
          rulesColor={borderColor}
          isAnimated
        />
      </View>

      {/* Grade progression chart (temporarily disabled) */}
      {/* <View
        style={{
          marginHorizontal: 16,
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
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {t('ascents.gradeProgress')}
          </Text>
          <View
            style={{
              backgroundColor: '#22c55e18',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#22c55e' }}>+2 рівні</Text>
          </View>
        </View>
        <View style={{ overflow: 'hidden' }}>
          <LineChart
            data={progressData}
            curved
            color={ACCENT}
            thickness={3}
            dataPointsColor={ACCENT}
            dataPointsRadius={5}
            startFillColor={ACCENT + '40'}
            endFillColor="transparent"
            areaChart
            noOfSections={4}
            maxValue={Math.max(6, ...progressData.map((d) => d.value)) + 2}
            width={chartWidth - 52}
            yAxisLabelWidth={36}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={borderColor}
            yAxisTextStyle={{ color: labelColor, fontSize: 10 }}
            rulesColor={borderColor}
            xAxisLabelTexts={progressLabels}
            xAxisLabelTextStyle={{ color: labelColor, fontSize: 10 }}
            initialSpacing={8}
            endSpacing={4}
            isAnimated
          />
        </View>
      </View> */}

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
            color: isDark ? '#fff' : '#000',
            marginBottom: 14,
          }}>
          {t('ascents.typeBreakdown')}
        </Text>
        <View style={{ gap: 10 }}>
          {typeCounts.map(({ type, count, meta }) => {
            const pct =
              stats.total > 0
                ? count / stats.total
                : [0.35, 0.2, 0.3, 0.15][typeCounts.findIndex((tc) => tc.type === type)];
            return (
              <View key={type} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: meta.color }}>
                    {meta.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.6)' }}>{count}</Text>
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
                      backgroundColor: meta.color,
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
