import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Mountain } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { FilterChip } from '@/shared/ui/filter-chip';
import { AscentCard } from '@/entities/ascent/ui/ascent-card';
import { ACCENT } from '@/shared/config/palette';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { ASCENT_FILTERS, useAscentTypeFilter } from '@/widgets/ascents/model/useAscentTypeFilter';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/constants';

interface AscentsListProps {
  ascents:   Ascent[];
  isLoading: boolean;
}

export function AscentsList({ ascents, isLoading }: AscentsListProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { activeFilter, setActiveFilter, filteredAscents } = useAscentTypeFilter(ascents);

  return (
    <>
      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {ASCENT_FILTERS.map((f) => {
          const typeMeta = f.key !== 'all' ? ASCENT_TYPE_META[f.key] : null;
          return (
            <FilterChip
              key={f.key}
              label={t(f.tKey)}
              active={activeFilter === f.key}
              activeColor={typeMeta?.color ?? ACCENT}
              onPress={() => setActiveFilter(f.key)}
              isDark={isDark}
            />
          );
        })}
      </ScrollView>

      {/* List */}
      <View style={{ gap: 8, paddingHorizontal: 16 }}>
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : filteredAscents.length === 0 ? (
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
            <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: 'rgba(128,128,128,0.6)' }}>
              {t('ascents.noAscents')}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: 'rgba(128,128,128,0.45)', textAlign: 'center', paddingHorizontal: 32 }}>
              {activeFilter === 'all'
                ? t('ascents.logFirst')
                : t('ascents.noTypeAscents', { type: activeFilter })}
            </Text>
          </View>
        ) : (
          filteredAscents.map((ascent: Ascent) => <AscentCard key={ascent.id} ascent={ascent} />)
        )}
      </View>
    </>
  );
}
