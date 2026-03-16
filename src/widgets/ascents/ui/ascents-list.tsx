import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Mountain } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { FilterChip } from '@/shared/ui/filter-chip';
import { AscentCard } from '@/entities/ascent/ui/ascent-card';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/meta';
import { ACCENT } from '@/shared/config/palette';
import type { Ascent } from '@/entities/ascent/model/ascent';

const FILTERS = [
  { key: 'all',      tKey: 'ascents.filter.all'      },
  { key: 'FLASH',    tKey: 'ascents.filter.FLASH'    },
  { key: 'ONSIGHT',  tKey: 'ascents.filter.ONSIGHT'  },
  { key: 'REDPOINT', tKey: 'ascents.filter.REDPOINT' },
  { key: 'REPEAT',   tKey: 'ascents.filter.REPEAT'   },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

interface AscentsListProps {
  ascents:   Ascent[];
  isLoading: boolean;
}

export function AscentsList({ ascents, isLoading }: AscentsListProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeFilter, setActiveFilter] = React.useState<FilterKey>('all');

  const filtered = React.useMemo(
    () =>
      activeFilter === 'all'
        ? ascents
        : ascents.filter((a) => a.type?.toUpperCase() === activeFilter),
    [ascents, activeFilter]
  );

  return (
    <>
      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => {
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
        ) : filtered.length === 0 ? (
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
          filtered.map((ascent) => <AscentCard key={ascent.id} ascent={ascent} />)
        )}
      </View>
    </>
  );
}
