import { FlatList, StyleProp, ViewStyle } from 'react-native';
import { LoadingSpinner } from './loading-spinner';

interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactElement;
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
}: InfiniteListProps<T>) {
  return (
    <FlatList
      data={items}
      contentContainerStyle={contentContainerStyle}
      renderItem={({ item }) => renderItem(item)}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
}
