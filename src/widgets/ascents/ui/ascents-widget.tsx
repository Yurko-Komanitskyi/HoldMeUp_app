import * as React from 'react';
import { View } from 'react-native';

import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { InfiniteList } from '@/shared/ui/Infinite-list';
import { AscentHeader } from './acsent-header';
import { AscentCard } from '@/entities/ascent/ui/ascent-card';
import { AscentFilters, useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { Mountain } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';

export function AscentsWidget() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [filters, setFilters] = React.useState<AscentFilters>({});

  const { items, isLoading, isFetchingNextPage, hasNextPage, loadMore } = useAscentsQuery(filters);

  const ascentHeader = React.useMemo(() => <AscentHeader setFilters={setFilters} />, []);

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <InfiniteList
        items={items}
        ListHeaderComponent={ascentHeader}
        renderItem={(ascent) => <AscentCard ascent={ascent} />}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        estimatedItemSize={100}
        ListEmptyComponent={
          <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center' }}>
            <View
              style={{
                alignItems: 'center',
                borderRadius: 20,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                paddingVertical: 48,
              }}>
              <Mountain size={40} color="rgba(128,128,128,0.3)" />
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: '600',
                  color: 'rgba(128,128,128,0.6)',
                }}>
                {t('ascents.noAscents')}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: 'rgba(128,128,128,0.45)',
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}>
                {t('ascents.logFirst')}
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}
