import * as React from 'react';
import { FlatList, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { LoadingSpinner } from './loading-spinner';

interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onLoadMore: () => void;
  ListEmptyComponent?: React.ReactElement;
  estimatedItemSize?: number;
  showsVerticalScrollIndicator?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  refreshTintColor?: string;
  listRef?: React.Ref<FlatList<T>>;
}

export function InfiniteList<T>({
  items,
  ListHeaderComponent,
  renderItem,
  keyExtractor,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  ListEmptyComponent,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  onRefresh,
  isRefreshing = false,
  refreshTintColor,
  listRef,
}: InfiniteListProps<T>) {
  return (
    <FlatList
      ref={listRef}
      data={items}
      contentContainerStyle={contentContainerStyle}
      renderItem={({ item, index }) => renderItem(item, index)}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={refreshTintColor}
          />
        ) : undefined
      }
    />
  );
}
