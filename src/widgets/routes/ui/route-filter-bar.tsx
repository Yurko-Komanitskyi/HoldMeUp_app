import * as React from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { GRADES, ROUTE_COLORS, STYLE_LABELS } from '@/entities/route/lib/constants';
import type { RouteUiFilters } from '@/widgets/routes/model/useRouteFilters';

const STYLE_OPTIONS = [
  { value: 'BOULDER',  label: STYLE_LABELS.boulder   },
  { value: 'LEAD',     label: STYLE_LABELS.lead       },
  { value: 'TOP_ROPE', label: STYLE_LABELS.top_rope   },
  { value: 'SPEED',    label: STYLE_LABELS.speed      },
];

const STATUS_OPTIONS = [
  { value: null,       label: 'Всі'        },
  { value: 'ACTIVE',   label: 'Активні'    },
  { value: 'ARCHIVED', label: 'Архівовані' },
  { value: 'DRAFT',    label: 'Чернетки'   },
];

interface Props {
  filters:         RouteUiFilters;
  hasActiveFilters: boolean;
  onSearchChange:  (v: string) => void;
  onGradeChange:   (v: string | null) => void;
  onStyleChange:   (v: string | null) => void;
  onStatusChange:  (v: string | null) => void;
  onColorChange:   (v: string | null) => void;
  onClearFilters:  () => void;
}

function FilterLabel({ children }: { children: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Text style={{
      fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
      textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 16,
    }}>
      {children}
    </Text>
  );
}

export function RouteFilterBar({
  filters, hasActiveFilters,
  onSearchChange, onGradeChange, onStyleChange, onStatusChange, onColorChange, onClearFilters,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = React.useState(false);

  const detailCount = [filters.grade, filters.style, filters.color].filter(Boolean).length;

  const inputBg        = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const placeholderCol = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const iconColor      = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const chipBorder     = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const chipBg         = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  function StatusChip({ value, label }: { value: string | null; label: string }) {
    const active = filters.status === value;
    return (
      <TouchableOpacity
        onPress={() => onStatusChange(active ? null : value)}
        style={{
          paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
          borderWidth: 1,
          borderColor: active ? ACCENT : chipBorder,
          backgroundColor: active ? ACCENT + '1e' : chipBg,
        }}>
        <Text style={{
          fontSize: 13, fontWeight: active ? '700' : '500',
          color: active ? ACCENT : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'),
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  function FilterChip({ value, label, active, onPress }: {
    value: string; label: string; active: boolean; onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
          borderColor: active ? ACCENT : chipBorder,
          backgroundColor: active ? ACCENT + '1e' : chipBg,
        }}>
        <Text style={{
          fontSize: 13, fontWeight: active ? '700' : '500',
          color: active ? ACCENT : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'),
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ gap: 10 }}>

      {/* Search bar */}
      <View style={{
        marginHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderRadius: 16, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        backgroundColor: inputBg,
      }}>
        <Search size={15} color={placeholderCol} />
        <TextInput
          value={filters.searchRaw}
          onChangeText={onSearchChange}
          placeholder="Пошук за назвою, описом..."
          placeholderTextColor={placeholderCol}
          style={{ flex: 1, color: isDark ? '#fff' : '#000', fontSize: 14, paddingVertical: 0 }}
          returnKeyType="search"
          autoCorrect={false}
        />
        {filters.searchRaw.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={8}>
            <X size={15} color={placeholderCol} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status row + filter button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 7 }}>
          {STATUS_OPTIONS.map((opt) => (
            <StatusChip key={String(opt.value)} value={opt.value} label={opt.label} />
          ))}
        </ScrollView>

        {/* Expand button */}
        <TouchableOpacity
          onPress={() => setExpanded((e) => !e)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
            borderColor: (expanded || detailCount > 0) ? ACCENT : chipBorder,
            backgroundColor: (expanded || detailCount > 0) ? ACCENT + '1e' : chipBg,
          }}>
          <SlidersHorizontal size={14} color={(expanded || detailCount > 0) ? ACCENT : iconColor} />
          {detailCount > 0 && (
            <View style={{
              width: 16, height: 16, borderRadius: 8, backgroundColor: ACCENT,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#fff' }}>{detailCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Expanded filter panel */}
      {expanded && (
        <View style={{
          marginHorizontal: 16, borderRadius: 18, borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          paddingVertical: 16, gap: 16,
          overflow: 'hidden',
        }}>

          {/* Style */}
          <View>
            <FilterLabel>Стиль</FilterLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}>
              {STYLE_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  active={filters.style === opt.value}
                  onPress={() => onStyleChange(filters.style === opt.value ? null : opt.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Grade */}
          <View>
            <FilterLabel>Категорія</FilterLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}>
              {GRADES.map((g) => (
                <FilterChip
                  key={g}
                  value={g}
                  label={g}
                  active={filters.grade === g}
                  onPress={() => onGradeChange(filters.grade === g ? null : g)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Color */}
          <View>
            <FilterLabel>Колір</FilterLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 2 }}>
              {ROUTE_COLORS.map((c) => {
                const active = filters.color === c.value;
                const swatch = c.hex;
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => onColorChange(active ? null : c.value)}
                    style={{ alignItems: 'center', gap: 5 }}>
                    <View style={{
                      width: 30, height: 30, borderRadius: 15,
                      borderWidth: active ? 2.5 : 1.5,
                      borderColor: active ? ACCENT : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                      overflow: 'hidden',
                      transform: [{ scale: active ? 1.15 : 1 }],
                    }}>
                      {swatch === null ? (
                        <LinearGradient
                          colors={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={{ flex: 1 }}
                        />
                      ) : (
                        <View style={{ flex: 1, backgroundColor: swatch }} />
                      )}
                    </View>
                    <Text style={{
                      fontSize: 9,
                      color: active ? ACCENT : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                      fontWeight: active ? '700' : '400',
                    }}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Clear button (if active) */}
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={onClearFilters}
              style={{
                marginHorizontal: 16, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 9,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}>
              <X size={13} color={iconColor} />
              <Text style={{ fontSize: 13, fontWeight: '500', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Скинути всі фільтри
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active filter summary (when collapsed and has active detail filters) */}
      {!expanded && detailCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
          {filters.grade && (
            <TouchableOpacity
              onPress={() => onGradeChange(null)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
                backgroundColor: ACCENT + '1e', borderWidth: 1, borderColor: ACCENT + '50',
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: ACCENT }}>{filters.grade}</Text>
              <X size={10} color={ACCENT} />
            </TouchableOpacity>
          )}
          {filters.style && (
            <TouchableOpacity
              onPress={() => onStyleChange(null)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
                backgroundColor: ACCENT + '1e', borderWidth: 1, borderColor: ACCENT + '50',
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: ACCENT }}>
                {STYLE_LABELS[filters.style.toLowerCase()] ?? filters.style}
              </Text>
              <X size={10} color={ACCENT} />
            </TouchableOpacity>
          )}
          {filters.color && (
            <TouchableOpacity
              onPress={() => onColorChange(null)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
                backgroundColor: ACCENT + '1e', borderWidth: 1, borderColor: ACCENT + '50',
              }}>
              {(() => {
                const entry = ROUTE_COLORS.find((c) => c.value === filters.color);
                return entry ? (
                  <View style={{
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: entry.hex ?? '#f97316',
                    overflow: 'hidden',
                  }}>
                    {entry.hex === null && (
                      <LinearGradient
                        colors={['#ef4444', '#22c55e', '#3b82f6']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                ) : null;
              })()}
              <X size={10} color={ACCENT} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
