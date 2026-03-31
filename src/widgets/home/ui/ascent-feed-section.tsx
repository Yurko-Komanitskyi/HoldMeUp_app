import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useAscentFeedQuery } from '@/entities/ascent/model/ascentHooks';
import { AscentFeedCard } from '@/entities/ascent/ui/ascent-feed-card';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function AscentFeedSection() {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    loadMore,
    isFetchingNextPage,
  } = useAscentFeedQuery();

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.8,
            color: colors.mutedForeground,
          }}>
          {t('home.feedTitle').toUpperCase()}
        </Text>
      </View>

      {isError && items.length === 0 ? (
        <QueryErrorPanel
          variant="compact"
          error={error ?? new Error('')}
          onRetry={() => void refetch()}
        />
      ) : isLoading && items.length === 0 ? (
        <View style={{ gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 20,
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center' }}>
            {t('home.feedEmpty')}
          </Text>
        </View>
      ) : (
        <>
          {items.map((item) => (
            <AscentFeedCard key={item.id} item={item} />
          ))}
          {hasNextPage ? (
            <Pressable
              onPress={() => loadMore()}
              disabled={isFetchingNextPage}
              style={{
                alignItems: 'center',
                paddingVertical: 14,
                marginBottom: 8,
              }}>
              {isFetchingNextPage ? (
                <ActivityIndicator color={ACCENT} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: '600', color: ACCENT }}>
                  {t('home.feedLoadMore')}
                </Text>
              )}
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}
