import { Text } from '@/shared/ui/text';
import { View } from 'react-native';
import { RouteFilterBar } from './route-filter-bar';
import { RouteGrade, RouteStatus, RouteStyle } from '@/entities/route/model/route';
import { RouteFilters } from '@/entities/route/model/routeHooks';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export function RoutesHeader({
  totalCount,
  isLoading,
  filters,
  hasActiveFilters,
  onSearchChange,
  onGradeChange,
  onStyleChange,
  onStatusChange,
  onColorChange,
  onClearFilters,
}: {
  totalCount: number;
  isLoading: boolean;
  filters: RouteFilters;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onGradeChange: (v: RouteGrade[] | undefined) => void;
  onStyleChange: (v: RouteStyle | undefined) => void;
  onStatusChange: (v: RouteStatus | undefined) => void;
  onColorChange: (v: string | undefined) => void;
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  return (
    <View style={{ paddingTop: 16, gap: 12, marginBottom: 4 }}>
      {/* Title row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            letterSpacing: -0.8,
            color: colors.foreground,
          }}>
          {t('routes.title')}
        </Text>

        {!isLoading && totalCount > 0 && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: colors.secondary,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.mutedForeground,
              }}>
              {totalCount}
            </Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <RouteFilterBar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={onSearchChange}
        onGradeChange={onGradeChange}
        onStyleChange={onStyleChange}
        onStatusChange={onStatusChange}
        onColorChange={onColorChange}
        onClearFilters={onClearFilters}
      />

      {/* Bottom divider */}
      <View
        style={{
          height: 0.5,
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}
