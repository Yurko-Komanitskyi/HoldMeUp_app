import { Text } from '@/shared/ui/text';
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';
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
  canToggleArchived,
  showArchived,
  onToggleArchived,
  canAddRoute,
  onAddRoute,
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
  canToggleArchived?: boolean;
  showArchived?: boolean;
  onToggleArchived?: () => void;
  canAddRoute?: boolean;
  onAddRoute?: () => void;
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
            lineHeight: 38,
            fontWeight: '800',
            letterSpacing: -0.8,
            color: colors.foreground,
          }}>
          {t('routes.title')}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {canAddRoute && onAddRoute ? (
            <TouchableOpacity
              onPress={onAddRoute}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: colors.primary + '1f',
                borderWidth: 1,
                borderColor: colors.primary + '66',
              }}>
              <Plus size={13} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                {t('tabs.addRoute')}
              </Text>
            </TouchableOpacity>
          ) : null}

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

      {canToggleArchived && onToggleArchived ? (
        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={onToggleArchived}
            activeOpacity={0.8}
            style={{
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: showArchived ? colors.primary : colors.border,
              backgroundColor: showArchived ? colors.primary + '22' : 'transparent',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: showArchived ? colors.primary : colors.mutedForeground,
              }}>
              {showArchived ? t('routes.hideArchived') : t('routes.loadArchived')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
