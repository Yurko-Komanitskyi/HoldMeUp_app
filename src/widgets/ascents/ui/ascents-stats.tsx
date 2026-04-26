import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import {
  TrendingUp,
  Target,
  Zap,
  Award,
  Layers,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { BarChart } from 'react-native-gifted-charts';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/constants';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { AscentType } from '@/entities/ascent/model/ascent';
import type { AscentStatsCurrent, AscentStatsResponse } from '@/entities/stats/api/types';
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

function calcSuccessRate(s: AscentStatsCurrent | undefined): number {
  if (!s || s.totalAscents === 0) return 0;
  return Math.round((s.successfulAscents / s.totalAscents) * 100);
}

// ─── Delta badge ────────────────────────────────────────────────────────────

interface DeltaBadgeProps {
  delta: number | null;
  isRate?: boolean;
  size?: 'sm' | 'md';
}

function DeltaBadge({ delta, isRate, size = 'sm' }: DeltaBadgeProps) {
  if (delta == null || delta === 0) return null;
  const pos = delta > 0;
  const color = pos ? '#22c55e' : '#ef4444';
  const ArrowIcon = pos ? ArrowUp : ArrowDown;
  const abs = Math.abs(Math.round(delta));
  const label = isRate ? `${abs}%` : `${abs}`;
  const fontSize = size === 'md' ? 12 : 10;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <ArrowIcon size={fontSize - 1} color={color} />
      <Text style={{ fontSize, color, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ─── Primary stat card (2 per row, bigger) ──────────────────────────────────

interface PrimaryCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
  delta: number | null;
  isRateDelta?: boolean;
  mutedColor: string;
}

function PrimaryCard({ icon, value, label, color, delta, isRateDelta, mutedColor }: PrimaryCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color + '18',
        borderRadius: 20,
        padding: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: color + '35',
      }}>
      <Icon as={icon} size={18} color={color} />
      <Text style={{ fontSize: 30, fontWeight: '900', color, letterSpacing: -1.5, lineHeight: 34 }}>
        {value}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: mutedColor, fontWeight: '600' }}>{label}</Text>
        <DeltaBadge delta={delta} isRate={isRateDelta} size="md" />
      </View>
    </View>
  );
}

// ─── Secondary stat card (3 per row, compact) ───────────────────────────────

interface SecondaryCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
  delta?: number | null;
  mutedColor: string;
}

function SecondaryCard({ icon, value, label, color, delta, mutedColor }: SecondaryCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color + '15',
        borderRadius: 16,
        padding: 11,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: color + '28',
      }}>
      <Icon as={icon} size={15} color={color} />
      <Text style={{ fontSize: 20, fontWeight: '800', color, letterSpacing: -0.5 }}>{value}</Text>
      <Text
        style={{
          fontSize: 10,
          color: mutedColor,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: 13,
        }}>
        {label}
      </Text>
      {delta != null && delta !== 0 && (
        <DeltaBadge delta={delta} />
      )}
    </View>
  );
}

// ─── Frequency card ──────────────────────────────────────────────────────────

const FREQ_COLOR = '#22c55e';

interface FrequencyCardProps {
  activeDays: number;
  totalDays: number;
  avgPerWeek: number;
  isLoading: boolean;
  cardBg: string;
  borderColor: string;
  foreground: string;
  mutedColor: string;
}

function FrequencyCard({
  activeDays,
  totalDays,
  avgPerWeek,
  isLoading,
  cardBg,
  borderColor,
  foreground,
  mutedColor,
}: FrequencyCardProps) {
  const { t } = useTranslation();

  // Format: show one decimal only when it's not a whole number
  const avgDisplay =
    isLoading || totalDays === 0
      ? '…'
      : avgPerWeek === 0
        ? '—'
        : Number.isInteger(avgPerWeek)
          ? String(avgPerWeek)
          : avgPerWeek.toFixed(1);

  return (
    <View
      style={{
        backgroundColor: cardBg,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <CalendarDays size={15} color={FREQ_COLOR} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: foreground }}>
              {t('ascents.frequency')}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: mutedColor }}>
            {isLoading ? '…' : t('ascents.activeDays', { count: activeDays })}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '900',
              color: FREQ_COLOR,
              letterSpacing: -1,
              lineHeight: 34,
            }}>
            {avgDisplay}
          </Text>
          <Text style={{ fontSize: 11, color: mutedColor, fontWeight: '500' }}>
            {t('ascents.perWeek')}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface AscentsStatsProps {
  statsResponse: AscentStatsResponse | undefined;
  isLoading?: boolean;
  statsQueryError?: unknown;
  onRetryStats?: () => void;
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
  const previous = statsResponse?.previous;
  const comparison = statsResponse?.comparison;

  const total = current?.totalAscents ?? 0;
  const successCount = current?.successfulAscents ?? 0;
  const uniqueRoutes = current?.uniqueRoutes ?? 0;
  const successRate = calcSuccessRate(current);
  const flashCount = current?.byType?.[AscentType.FLASH] ?? 0;
  const maxGradeLabel = toDisplayableStat(current?.maxGrade);

  // Deltas (only when backend returned comparison data)
  const totalDelta: number | null = comparison?.totalAscents ?? null;
  const uniqueRoutesDelta: number | null = comparison?.uniqueRoutes ?? null;

  let successRateDelta: number | null = null;
  if (previous && previous.totalAscents > 0) {
    successRateDelta = successRate - calcSuccessRate(previous);
  }

  const weekdaysShort = t('common.weekdaysShort', { returnObjects: true }) as string[];

  const dailyCounts = statsResponse?.dailyCounts ?? [];
  const activeDays = dailyCounts.filter((d) => d.count > 0).length;
  const totalDays = dailyCounts.length;
  const weeksInPeriod = totalDays > 0 ? totalDays / 7 : 0;
  const avgPerWeek = weeksInPeriod > 0 ? activeDays / weeksInPeriod : 0;

  const weeklyData = React.useMemo(() => {
    return dailyCounts.map((dc) => {
      const [y, m, d] = dc.date.split('-').map(Number);
      const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
      const label = weekdaysShort[utc.getUTCDay()];
      return {
        value: dc.count,
        label,
        frontColor: dc.count > 0 ? ACCENT : colors.muted,
      };
    });
  }, [dailyCounts, colors.muted, weekdaysShort]);

  const maxBar = Math.max(4, ...weeklyData.map((d) => d.value), 1);

  const loading = isLoading ?? false;

  return (
    <>
      {/* ── Primary stats: Total + Success rate ───────────── */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PrimaryCard
          icon={TrendingUp}
          value={loading ? '…' : total}
          label={t('ascents.statTotal')}
          color={ACCENT}
          delta={loading ? null : totalDelta}
          mutedColor={labelColor}
        />
        <PrimaryCard
          icon={Target}
          value={loading ? '…' : `${successRate}%`}
          label={t('ascents.statSuccess')}
          color={colors.chart2}
          delta={loading ? null : successRateDelta}
          isRateDelta
          mutedColor={labelColor}
        />
      </View>

      {/* ── Secondary stats: Flash + Routes + Max ────────────── */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryCard
          icon={Zap}
          value={loading ? '…' : flashCount}
          label={t('ascents.statFlash')}
          color={colors.chart4}
          mutedColor={labelColor}
        />
        <SecondaryCard
          icon={Layers}
          value={loading ? '…' : uniqueRoutes}
          label={t('ascents.statRoutes')}
          color={colors.chart1}
          delta={loading ? null : uniqueRoutesDelta}
          mutedColor={labelColor}
        />
        <SecondaryCard
          icon={Award}
          value={loading ? '…' : maxGradeLabel}
          label={t('ascents.statMax')}
          color={colors.chart5}
          mutedColor={labelColor}
        />
      </View>

      {/* ── Frequency card (only for multi-day periods) ─────── */}
      {(loading || totalDays > 1) && (
        <FrequencyCard
          activeDays={activeDays}
          totalDays={totalDays}
          avgPerWeek={avgPerWeek}
          isLoading={loading}
          cardBg={cardBg}
          borderColor={borderColor}
          foreground={colors.foreground}
          mutedColor={labelColor}
        />
      )}

      {/* ── Weekly activity chart ──────────────────────────── */}
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
          <Text style={{ fontSize: 12, color: labelColor }}>
            {loading ? '…' : total} {t('ascents.periodCount')}
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
          <Text style={{ fontSize: 13, color: labelColor }}>
            {loading ? '…' : t('ascents.statsNoChart')}
          </Text>
        )}
      </View>

      {/* ── Type breakdown ────────────────────────────────── */}
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
            marginBottom: 16,
          }}>
          {t('ascents.typeBreakdown')}
        </Text>
        <View style={{ gap: 12 }}>
          {TYPE_ORDER.map((type) => {
            const count = current?.byType?.[type] ?? 0;
            const pct = total > 0 ? count / total : 0;
            const pctDisplay = Math.round(pct * 100);
            const metaColor = typeAccentColor(type, labelColor);
            const labelKey = ascentTypeLabelKey(type);
            return (
              <View key={type} style={{ gap: 7 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: metaColor }}>
                    {t(`logAscent.ascentTypeLabel.${labelKey}`)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: metaColor,
                        minWidth: 46,
                        textAlign: 'right',
                      }}>
                      {loading ? '…' : `${pctDisplay}%`}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: labelColor,
                        minWidth: 22,
                        textAlign: 'right',
                      }}>
                      {loading ? '' : count}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: borderColor,
                    borderRadius: 3,
                  }}>
                  <View
                    style={{
                      height: 6,
                      width: `${pctDisplay}%`,
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
