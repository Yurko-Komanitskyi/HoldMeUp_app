import * as React from 'react';
import { View, type FlatList } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { ACCENT } from '@/shared/config/palette';

import { InfiniteList } from '@/shared/ui/Infinite-list';
import { RouteCard } from '@/entities/route/ui/route-card';
import { RouteSkeletonCard } from '@/entities/route/ui/route-skeleton-card';
import { useRouteFilters } from '@/widgets/routes/model/useRouteFilters';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import type { Route } from '@/entities/route/model/route';
import { RoutesNoGymState } from './routes-no-gym-state';
import { RoutesEmptyState } from './routes-empty-state';
import { useArchivedRoutesQuery, useRoutesQuery } from '@/entities/route/model/routeHooks';
import { RoutesHeader } from './routes-header';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';

export function RoutesWidget() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships = useGymMemberStore((s) => s.memberships);
  const hasGym = memberships.length > 0 || !!currentGymId;
  const [showArchived, setShowArchived] = React.useState(false);
  const currentMembershipRole = memberships
    .find((m) => m.gym.id === currentGymId)
    ?.role?.toUpperCase?.();
  const canLoadArchived =
    currentMembershipRole === GymMemberRole.OWNER ||
    currentMembershipRole === GymMemberRole.MANAGER ||
    currentMembershipRole === GymMemberRole.SETTER;
  const canAddRoute = currentMembershipRole === GymMemberRole.SETTER;

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

  const routesQuery = useRoutesQuery({
    ...apiFilters,
    gymId: currentGymId ?? undefined,
  });
  const archivedRoutesQuery = useArchivedRoutesQuery(
    {
      ...apiFilters,
      gymId: currentGymId ?? undefined,
    },
    canLoadArchived && showArchived
  );
  const activeQuery = showArchived ? archivedRoutesQuery : routesQuery;

  const {
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    loadMore,
    isError,
    error,
  } = activeQuery;

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const routesListRef = useScrollToTopOnFocus<FlatList<Route>>();

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }

  if (!hasGym) {
    return <RoutesNoGymState />;
  }

  return (
    <View className="flex-1 bg-background">
      <InfiniteList
        listRef={routesListRef}
        items={items}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onLoadMore={loadMore}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        onRefresh={() => void handleRefresh()}
        isRefreshing={isRefreshing}
        refreshTintColor={ACCENT}
        ListHeaderComponent={
          <RoutesHeader
            totalCount={items.length}
            isLoading={isLoading}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onGradeChange={setGrade}
            onStyleChange={setStyle}
            onStatusChange={setStatus}
            onColorChange={setColor}
            onClearFilters={clearFilters}
            canToggleArchived={canLoadArchived}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((prev) => !prev)}
            canAddRoute={canAddRoute}
            onAddRoute={() => router.push('/add-route' as never)}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <RouteSkeletonCard />
                </View>
              ))}
            </View>
          ) : isError ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 8, minHeight: 280 }}>
              <QueryErrorPanel error={error ?? new Error('')} onRetry={() => void refetch()} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <RoutesEmptyState
                isDark={isDark}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            </View>
          )
        }
        renderItem={(item) => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <RouteCard route={item as Route} />
          </View>
        )}
      />
    </View>
  );
}
