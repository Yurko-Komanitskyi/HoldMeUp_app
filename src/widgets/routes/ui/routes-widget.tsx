import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mountain, ChevronDown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { RouteCard } from '@/entities/route/ui/route-card';
import { RouteFilterBar } from '@/widgets/routes/ui/route-filter-bar';
import { useRouteFilters } from '@/widgets/routes/model/useRouteFilters';
import { useRoutesInfiniteQuery } from '@/entities/route/model/useRoutesInfiniteQuery';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useUserStore } from '@/entities/user/model/userStore';
import { ACCENT } from '@/shared/config/palette';

function SkeletonCard() {
  return (
    <View style={{ height: 80, flexDirection: 'row', overflow: 'hidden', borderRadius: 16, borderWidth: 1 }} className="border-border bg-card">
      <Skeleton style={{ width: 6, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}>
        <Skeleton style={{ width: 44, height: 44, borderRadius: 12 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton style={{ height: 14, width: '65%', borderRadius: 6 }} />
          <Skeleton style={{ height: 11, width: '35%', borderRadius: 6 }} />
        </View>
      </View>
    </View>
  );
}

export function RoutesWidget() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const user         = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const memberships  = useGymMemberStore((s) => s.memberships);
  const hasGym       = memberships.length > 0 || !!currentGymId;

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    filters, apiFilters, hasActiveFilters,
    setSearch, setGrade, setStyle, setStatus, setColor, clearFilters,
  } = useRouteFilters();

  const queryFilters = React.useMemo(
    () => ({ gymId: currentGymId ?? undefined, ...apiFilters }),
    [currentGymId, apiFilters]
  );

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch,
  } = useRoutesInfiniteQuery(queryFilters, !!user && hasGym);

  const displayed = React.useMemo(
    () => data?.pages.flatMap((p) => p.routes) ?? [],
    [data]
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!hasGym) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }} className="bg-background">
        <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center' }}>
          <Mountain size={34} color={ACCENT} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: isDark ? '#fff' : '#000' }}>
          Спочатку оберіть зал
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/gym/join' as never)}
          style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: ACCENT }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Знайти зал</Text>
        </TouchableOpacity>
      </View>
    );
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
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 16 }}>
          <Text className="text-2xl font-bold text-foreground">Маршрути</Text>
          {!isLoading && (
            <Text className="text-sm text-muted-foreground">
              {totalShown}{hasNextPage ? '+' : ''}
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
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : displayed.length === 0 ? (
            <View style={{
              alignItems: 'center', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed',
              paddingVertical: 56, paddingHorizontal: 24,
            }} className="border-border">
              <Mountain size={44} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
              <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: isDark ? '#fff' : '#000' }}>
                {hasActiveFilters ? 'Нічого не знайдено' : 'Маршрутів поки немає'}
              </Text>
              <Text style={{ marginTop: 6, textAlign: 'center', fontSize: 13, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', lineHeight: 18 }}>
                {hasActiveFilters ? 'Спробуйте змінити або скинути фільтри' : 'Маршрути ще не додані до вашого залу'}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: ACCENT }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Скинути фільтри</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            displayed.map((route) => <RouteCard key={route.id} route={route} />)
          )}
        </View>

        {/* Load More */}
        {!isLoading && hasNextPage && (
          <TouchableOpacity
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              marginHorizontal: 16, height: 44, borderRadius: 14, borderWidth: 1,
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              opacity: isFetchingNextPage ? 0.6 : 1,
            }}>
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color={ACCENT} />
            ) : (
              <>
                <ChevronDown size={16} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                  Завантажити більше
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}
