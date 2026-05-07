import * as React from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { GRADES, ROUTE_COLORS } from '@/entities/route/lib/constants';
import { gradeColorForRouteGrade } from '@/entities/route/lib/route-grade';
import type { RouteFilters } from '@/entities/route/model/routeHooks';
import { RouteGrade, RouteStyle, RouteStatus } from '@/entities/route/model/route';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// const STATUS_OPTIONS: { value: RouteStatus; label: string; color: string }[] = [
//   { value: 'active', label: 'Активні', color: '#22c55e' },
//   { value: 'draft', label: 'Чернетки', color: '#f59e0b' },
//   { value: 'archived', label: 'Архів', color: '#9ca3af' },
// ];

interface Props {
  filters: RouteFilters;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onGradeChange: (v: RouteGrade[] | undefined) => void;
  onStyleChange: (v: RouteStyle | undefined) => void;
  onStatusChange: (v: RouteStatus | undefined) => void;
  onColorChange: (v: string | undefined) => void;
  onClearFilters: () => void;
}

function ActiveTag({
  label,
  isDark,
  onRemove,
  dotColor,
}: {
  label: string;
  isDark: boolean;
  onRemove: () => void;
  dotColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingLeft: dotColor ? 8 : 10,
        paddingRight: 7,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      }}>
      {dotColor && (
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColor }} />
      )}
      <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? '#e5e7eb' : '#374151' }}>
        {label}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <X size={11} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />
      </TouchableOpacity>
    </View>
  );
}

function ActiveColorTag({
  colorValue,
  isDark,
  onRemove,
}: {
  colorValue: string;
  isDark: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const colorEntry = ROUTE_COLORS.find((c) => c.value === colorValue);
  const label = colorEntry
    ? t(`routeColors.${colorEntry.value}`, { defaultValue: colorValue })
    : colorValue;
  const hex = colorEntry?.hex;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingLeft: 8,
        paddingRight: 7,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }}>
        {hex === null ? (
          <LinearGradient
            colors={['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: hex }} />
        )}
      </View>
      <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? '#e5e7eb' : '#374151' }}>
        {label}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <X size={11} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />
      </TouchableOpacity>
    </View>
  );
}

function FilterSectionLabel({ children, isDark }: { children: string; isDark: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
        paddingHorizontal: 16,
        marginBottom: 8,
      }}>
      {children}
    </Text>
  );
}

function FilterDivider({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        marginHorizontal: 16,
      }}
    />
  );
}

export function RouteFilterBar({
  filters,
  hasActiveFilters,
  onSearchChange,
  onGradeChange,
  onStyleChange,
  onStatusChange,
  onColorChange,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = React.useState(false);

  const STYLE_OPTIONS = React.useMemo(
    (): { value: RouteStyle; label: string }[] => [
      { value: 'boulder', label: t('routes.styleKeys.boulder') },
      { value: 'lead', label: t('routes.styleKeys.lead') },
      { value: 'top_rope', label: t('routes.styleKeys.top_rope') },
      { value: 'speed', label: t('routes.styleKeys.speed') },
    ],
    [t]
  );

  const detailCount = [filters.grade, filters.style, filters.color, filters.status].filter(
    Boolean
  ).length;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)';
  const placeholder = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)';
  const iconCol = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)';

  const filterActive = expanded || detailCount > 0;

  return (
    <View style={{ gap: 9 }}>
      {/* Search + filter toggle row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            height: 42,
            borderRadius: 13,
            paddingHorizontal: 12,
            backgroundColor: inputBg,
          }}>
          <Search size={14} color={placeholder} />
          <TextInput
            value={filters.search ?? ''}
            onChangeText={onSearchChange}
            placeholder={t('routes.searchRouteShort')}
            placeholderTextColor={placeholder}
            style={{
              flex: 1,
              color: isDark ? '#fff' : '#000',
              fontSize: 14,
              paddingVertical: 0,
            }}
            returnKeyType="search"
            autoCorrect={false}
          />
          {(filters.search?.length ?? 0) > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={10}>
              <X size={13} color={placeholder} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={toggle}
          activeOpacity={0.75}
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: filterActive ? 1.5 : 1,
            borderColor: filterActive
              ? ACCENT
              : isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.08)',
            backgroundColor: filterActive
              ? ACCENT + '14'
              : isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.02)',
          }}>
          <SlidersHorizontal size={15} color={filterActive ? ACCENT : iconCol} />
          {detailCount > 0 && !expanded && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: ACCENT,
                borderWidth: 1.5,
                borderColor: isDark ? '#0a0a0a' : '#fff',
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Active filter chips (collapsed) */}
      {!expanded && detailCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
          {filters.grade && (
            <ActiveTag
              label={filters.grade.join(', ')}
              isDark={isDark}
              onRemove={() => onGradeChange(undefined)}
            />
          )}
          {filters.style && (
            <ActiveTag
              label={t(`routes.styleKeys.${filters.style}`)}
              isDark={isDark}
              onRemove={() => onStyleChange(undefined)}
            />
          )}
          {/* {filters.status && (
            <ActiveTag
              label={STATUS_OPTIONS.find((s) => s.value === filters.status)?.label ?? filters.status}
              dotColor={STATUS_OPTIONS.find((s) => s.value === filters.status)?.color}
              isDark={isDark}
              onRemove={() => onStatusChange(undefined)}
            />
          )} */}
          {filters.color && (
            <ActiveColorTag
              colorValue={filters.color}
              isDark={isDark}
              onRemove={() => onColorChange(undefined)}
            />
          )}
        </ScrollView>
      )}

      {/* Expanded filter panel */}
      {expanded && (
        <View
          style={{
            marginHorizontal: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.015)',
            paddingVertical: 14,
            gap: 12,
            overflow: 'hidden',
          }}>

          {/* Status */}
          {/* <View>
            <FilterSectionLabel isDark={isDark}>{t('routeForm.status')}</FilterSectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}>
              {STATUS_OPTIONS.map((opt) => {
                const isActive = filters.status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onStatusChange(isActive ? undefined : opt.value)}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isActive
                        ? opt.color
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.1)',
                      backgroundColor: isActive ? opt.color + '1a' : 'transparent',
                    }}>
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: isActive
                          ? opt.color
                          : isDark
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(0,0,0,0.2)',
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? '600' : '400',
                        color: isActive
                          ? opt.color
                          : isDark
                            ? 'rgba(255,255,255,0.55)'
                            : 'rgba(0,0,0,0.55)',
                      }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View> */}

          <FilterDivider isDark={isDark} />

          {/* Style */}
          <View>
            <FilterSectionLabel isDark={isDark}>{t('routes.filterStyle')}</FilterSectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}>
              {STYLE_OPTIONS.map((opt) => {
                const isActive = filters.style === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onStyleChange(isActive ? undefined : opt.value)}
                    activeOpacity={0.75}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isActive
                        ? ACCENT
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.1)',
                      backgroundColor: isActive ? ACCENT + '1a' : 'transparent',
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? '600' : '400',
                        color: isActive
                          ? ACCENT
                          : isDark
                            ? 'rgba(255,255,255,0.55)'
                            : 'rgba(0,0,0,0.55)',
                      }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FilterDivider isDark={isDark} />

          {/* Grade */}
          <View>
            <FilterSectionLabel isDark={isDark}>{t('routes.filterGrade')}</FilterSectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
              {GRADES.map((g) => {
                const isActive = filters.grade?.includes(g as RouteGrade);
                const gradeColor = gradeColorForRouteGrade(g);
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() =>
                      onGradeChange(
                        isActive
                          ? filters.grade!.length > 1
                            ? filters.grade!.filter((gr) => gr !== g)
                            : undefined
                          : [...(filters.grade ?? []), g as RouteGrade]
                      )
                    }
                    activeOpacity={0.75}
                    style={{
                      height: 34,
                      minWidth: 42,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isActive
                        ? gradeColor
                        : isDark
                          ? `${gradeColor}66`
                          : `${gradeColor}55`,
                      backgroundColor: isActive ? `${gradeColor}1f` : `${gradeColor}12`,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? '700' : '400',
                        color: isActive ? gradeColor : isDark ? `${gradeColor}cc` : `${gradeColor}d9`,
                      }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <FilterDivider isDark={isDark} />

          {/* Color */}
          <View>
            <FilterSectionLabel isDark={isDark}>{t('routes.filterColor')}</FilterSectionLabel>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 2 }}>
              {ROUTE_COLORS.map((c) => {
                const isActive = filters.color === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => onColorChange(isActive ? undefined : c.value)}
                    activeOpacity={0.75}
                    style={{ alignItems: 'center', gap: 5 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        padding: 2,
                        borderWidth: isActive ? 2.5 : 1,
                        borderColor: isActive
                          ? ACCENT
                          : isDark
                            ? 'rgba(255,255,255,0.16)'
                            : 'rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                      }}>
                      {c.hex === null ? (
                        <LinearGradient
                          colors={[
                            '#ef4444',
                            '#f97316',
                            '#eab308',
                            '#22c55e',
                            '#3b82f6',
                            '#a855f7',
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ flex: 1, borderRadius: 12 }}
                        />
                      ) : (
                        <View style={{ flex: 1, borderRadius: 11, backgroundColor: c.hex }} />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 9,
                        color: isActive
                          ? ACCENT
                          : isDark
                            ? 'rgba(255,255,255,0.38)'
                            : 'rgba(0,0,0,0.38)',
                        fontWeight: isActive ? '700' : '400',
                      }}>
                      {t(`routeColors.${c.value}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Clear all */}
          {hasActiveFilters && (
            <>
              <FilterDivider isDark={isDark} />
              <TouchableOpacity
                onPress={() => {
                  onClearFilters();
                  toggle();
                }}
                activeOpacity={0.7}
                style={{
                  marginHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderRadius: 12,
                  paddingVertical: 10,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}>
                <X size={12} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                  }}>
                  {t('routes.clearAllFilters')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}
