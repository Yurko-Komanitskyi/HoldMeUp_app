// ascent-filter.tsx
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { FilterChip } from '@/shared/ui/filter-chip';
import { SectionLabel } from '@/shared/ui/section-label';
import type { AscentFilters } from '@/entities/ascent/model/ascentHooks';
import { AscentType } from '@/entities/ascent/model/ascent';
import { ACCENT } from '@/shared/config/palette';
import { useTranslation } from 'react-i18next';

// ─── types ───────────────────────────────────────────────
type PeriodKey = 'all' | 'week' | 'month';

const CHIP_PILL_STYLE = {
  borderRadius: 99,
  paddingHorizontal: 13,
  paddingVertical: 6,
} as const;

// ─── helpers ─────────────────────────────────────────────
// Повертаємо ISO-рядок, бо бекенд-фільтри `dateFrom/dateTo` очікують саме строкове представлення дати.
function subDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function getActivePeriod(filters: AscentFilters): PeriodKey {
  if (!filters.dateFrom) return 'all';
  const df = new Date(filters.dateFrom).getTime();
  const now = Date.now();
  const diff = now - df;
  const DAY = 86_400_000;
  if (diff < 8 * DAY) return 'week';
  if (diff < 31 * DAY) return 'month';
  return 'all';
}

function countActive(filters: AscentFilters): number {
  let n = 0;
  if (filters.dateFrom) n++;
  if (filters.type) n++;
  if (filters.success !== undefined) n++;
  return n;
}

// ─── Main component ───────────────────────────────────────
interface AscentFilterBarProps {
  setFilters: (f: AscentFilters) => void;
}

export function AscentFilterBar({ setFilters }: AscentFilterBarProps) {
  const { t } = useTranslation();
  const PERIODS = React.useMemo(
    (): { key: PeriodKey; label: string; getDateFrom: () => string | undefined }[] => [
      { key: 'all', label: t('ascents.filterPeriod.all'), getDateFrom: () => undefined },
      { key: 'week', label: t('ascents.filterPeriod.week'), getDateFrom: () => subDays(7) },
      { key: 'month', label: t('ascents.filterPeriod.month'), getDateFrom: () => subDays(30) },
    ],
    [t]
  );
  const ASCENT_TYPE_OPTIONS = React.useMemo(
    (): { value: AscentType; label: string }[] => [
      { value: AscentType.FLASH, label: t('ascents.filterTypeShort.FLASH') },
      { value: AscentType.ON_SIGHT, label: t('ascents.filterTypeShort.ON_SIGHT') },
      { value: AscentType.REDPOINT, label: t('ascents.filterTypeShort.REDPOINT') },
    ],
    [t]
  );

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [localFilters, setLocalFilters] = React.useState<AscentFilters>({});

  const [open, setOpen] = React.useState(false);
  const progress = useSharedValue(0);

  // виміряємо реальну висоту панелі один раз
  const [panelHeight, setPanelHeight] = React.useState(0);
  const measured = React.useRef(false);

  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 260 });
  }, [open]);

  const panelStyle = useAnimatedStyle(() => ({
    // height/opacity синхронізуємо з measured висотою, щоб панель плавно "відкривалась" без layout-jumps.
    height: interpolate(progress.value, [0, 1], [0, panelHeight]),
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.6, 1]),
    overflow: 'hidden',
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
  }));

  const activeCount = countActive(localFilters);
  const activePeriod = getActivePeriod(localFilters);

  // ── handlers ──────────────────────────────────────────
  const setPeriod = (key: PeriodKey) => {
    const p = PERIODS.find((x) => x.key === key)!;
    setFilters({ ...localFilters, dateFrom: p.getDateFrom(), dateTo: undefined });
    setLocalFilters({ ...localFilters, dateFrom: p.getDateFrom(), dateTo: undefined });
  };

  const toggleType = (type: AscentType) => {
    setLocalFilters({ ...localFilters, type: localFilters?.type === type ? undefined : type });
    setFilters({ ...localFilters, type: localFilters?.type === type ? undefined : type });
  };
  const toggleSuccess = (val: boolean) => {
    setLocalFilters({ ...localFilters, success: localFilters?.success === val ? undefined : val });
    setFilters({ ...localFilters, success: localFilters?.success === val ? undefined : val });
  };

  const clearAll = () => {
    setLocalFilters({});
    setFilters({});
    setLocalFilters({});
  };

  // ── styles ─────────────────────────────────────────────
  const borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const bg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const triggerActive = activeCount > 0;

  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor, backgroundColor: bg }}>
      {/* ── trigger row ─────────────────────────────── */}
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 11,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal
            size={15}
            color={triggerActive ? ACCENT : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: triggerActive
                ? isDark
                  ? '#fff'
                  : '#000'
                : isDark
                  ? 'rgba(255,255,255,0.55)'
                  : 'rgba(0,0,0,0.5)',
            }}>
            {t('ascents.filterPanel.title')}
          </Text>

          {/* active badge */}
          {activeCount > 0 && (
            <View
              style={{
                backgroundColor: ACCENT,
                borderRadius: 99,
                minWidth: 18,
                height: 18,
                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{activeCount}</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {activeCount > 0 && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                clearAll();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />
            </TouchableOpacity>
          )}
          <Animated.View style={chevronStyle}>
            <ChevronDown size={16} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* ── animated panel ────────  ──────────────────── */}
      <Animated.View style={panelStyle}>
        {/* вимірюємо один раз поки hidden */}
        <View
          onLayout={(e) => {
            if (!measured.current && e.nativeEvent.layout.height > 0) {
              setPanelHeight(e.nativeEvent.layout.height);
              measured.current = true;
            }
          }}
          style={{
            position: panelHeight === 0 ? 'absolute' : 'relative',
            opacity: panelHeight === 0 ? 0 : 1,
          }}>
          <View style={{ height: 1, backgroundColor: divider }} />

          <View style={{ padding: 14, gap: 14 }}>
            {/* Period */}
            <View>
              <SectionLabel>{t('ascents.filterPanel.period')}</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {PERIODS.map((p) => (
                  <FilterChip
                    key={p.key}
                    label={p.label}
                    active={activePeriod === p.key}
                    onPress={() => setPeriod(p.key)}
                    isDark={isDark}
                    style={CHIP_PILL_STYLE}
                  />
                ))}
              </View>
            </View>

            {/* Type */}
            <View>
              <SectionLabel>{t('ascents.filterPanel.type')}</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {ASCENT_TYPE_OPTIONS.map((item) => (
                  <FilterChip
                    key={item.value}
                    label={item.label}
                    active={localFilters.type === item.value}
                    onPress={() => toggleType(item.value)}
                    isDark={isDark}
                    style={CHIP_PILL_STYLE}
                  />
                ))}
              </View>
            </View>

            {/* Success */}
            <View>
              <SectionLabel>{t('ascents.filterPanel.result')}</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <FilterChip
                  label={t('ascents.filterPanel.success')}
                  active={localFilters.success === true}
                  onPress={() => toggleSuccess(true)}
                  isDark={isDark}
                  style={CHIP_PILL_STYLE}
                />
                <FilterChip
                  label={t('ascents.filterPanel.fail')}
                  active={localFilters.success === false}
                  onPress={() => toggleSuccess(false)}
                  isDark={isDark}
                  style={CHIP_PILL_STYLE}
                />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Backward-compatible export for existing imports (acsent-header.tsx expects `AscentFilter`).
export const AscentFilter = AscentFilterBar;
