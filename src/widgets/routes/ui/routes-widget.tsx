import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { RouteCard } from '@/entities/route/ui/route-card';
import { RouteSkeletonCard } from '@/entities/route/ui/route-skeleton-card';
import { RouteFilterBar } from '@/widgets/routes/ui/route-filter-bar';
import { useRouteFilters } from '@/widgets/routes/model/useRouteFilters';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useUserStore } from '@/entities/user/model/userStore';
import { ACCENT } from '@/shared/config/palette';
import type { Route } from '@/entities/route/model/route';
import { RoutesNoGymState } from './routes-no-gym-state';
import { RoutesEmptyState } from './routes-empty-state';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';

export function RoutesWidget() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);
  const hasGym = memberships.length > 0 || !!currentGymId;

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    filters,
    apiFilters,
    hasActiveFilters,
    setSearch,
    setGrade,
    setStyle,
    setStatus,
    setColor,
    clearFilters,
  } = useRouteFilters();

  const queryFilters = React.useMemo(
    () => ({ gymId: currentGymId ?? undefined, ...apiFilters }),
    [currentGymId, apiFilters]
  );

  const { data, isLoading, refetch } =
    useRoutesQuery({ gymId: currentGymId ?? '', ...apiFilters });

  const displayed: Route[] = React.useMemo(() => data ?? [], [data]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!hasGym) {
    return <RoutesNoGymState isDark={isDark} />;
  }

  const totalShown = displayed.length;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
      }>
      <View style={{ gap: 14, paddingTop: 16 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}>
          <Text className="text-2xl font-bold text-foreground">Маршрути</Text>
          {!isLoading && (
            <Text className="text-sm text-muted-foreground">
              {totalShown}
            </Text>
          )}
        </View>

        {/* Filters */}
        <RouteFilterBar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearch}
          onGradeChange={setGrade}
          onStyleChange={setStyle}
          onStatusChange={setStatus}
          onColorChange={setColor}
          onClearFilters={clearFilters}
        />

        {/* List */}
        <View style={{ gap: 8, paddingHorizontal: 16 }}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <RouteSkeletonCard key={i} />)
          ) : displayed.length === 0 ? (
            <RoutesEmptyState
              isDark={isDark}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            displayed.map((route: Route) => <RouteCard key={route.id} route={route} />)
          )}
        </View>

        {/* Load More */}
        {!isLoading && displayed.length > 0 && (
          <TouchableOpacity
            style={{
              marginHorizontal: 16,
              height: 44,
              borderRadius: 14,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            }}>
              <>
                <ChevronDown
                  size={16}
                  color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  }}>
                  Завантажити більше
                </Text>
              </>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
