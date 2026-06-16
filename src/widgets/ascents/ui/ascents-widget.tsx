import * as React from 'react';
import { ActivityIndicator, View, type FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTranslation } from 'react-i18next';
import { InfiniteList } from '@/shared/ui/Infinite-list';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';
import { AscentHeader } from './acsent-header';
import { AscentCard } from '@/entities/ascent/ui/ascent-card';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { AscentFilters, useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { ascentFiltersToMyStatsParams } from '@/entities/stats/lib/ascent-filters-to-stats';
import { useMyStatsQuery } from '@/entities/stats/model/statsHooks';
import { Mountain } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';

export function AscentsWidget() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [filters, setFilters] = React.useState<AscentFilters>({});
  const ascentsListRef = useScrollToTopOnFocus<FlatList<Ascent>>();

  const {
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    isError,
    error,
    refetch,
  } = useAscentsQuery(filters);

  const statsParams = React.useMemo(() => ascentFiltersToMyStatsParams(filters), [filters]);
  const {
    data: myStats,
    isLoading: statsLoading,
    isError: statsIsError,
    error: statsError,
    refetch: refetchStats,
  } = useMyStatsQuery(statsParams);

  const ascentHeader = React.useMemo(
    () => (
      <AscentHeader
        setFilters={setFilters}
        statsResponse={myStats}
        statsLoading={statsLoading}
        statsQueryError={statsIsError ? statsError : undefined}
        onRetryStats={() => void refetchStats()}
      />
    ),
    [myStats, statsLoading, statsIsError, statsError, refetchStats]
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <InfiniteList
        listRef={ascentsListRef}
        items={items}
        ListHeaderComponent={ascentHeader}
        renderItem={(ascent, index) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 55).duration(360).springify().damping(18)}>
            <AscentCard ascent={ascent} />
          </Animated.View>
        )}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        estimatedItemSize={100}
        ListEmptyComponent={
          isLoading && items.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : isError && items.length === 0 ? (
            <View style={{ paddingHorizontal: 8, paddingVertical: 24, minHeight: 260 }}>
              <QueryErrorPanel error={error ?? new Error('')} onRetry={() => void refetch()} />
            </View>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center' }}>
              <View
                style={{
                  alignItems: 'center',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: colors.border,
                  paddingVertical: 48,
                }}>
                <Mountain size={40} color={colors.mutedForeground} />
                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.mutedForeground,
                  }}>
                  {t('ascents.noAscents')}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: colors.mutedForeground,
                    textAlign: 'center',
                    paddingHorizontal: 32,
                  }}>
                  {t('ascents.logFirst')}
                </Text>
              </View>
            </View>
          )
        }
      />
    </View>
  );
}
