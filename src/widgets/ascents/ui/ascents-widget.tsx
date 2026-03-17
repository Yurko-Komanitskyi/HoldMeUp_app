import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { FilterChip } from '@/shared/ui/filter-chip';
import { AscentsStats } from '@/widgets/ascents/ui/ascents-stats';
import { AscentsList } from '@/widgets/ascents/ui/ascents-list';
import { RoutePickerModal } from '@/features/route-picker/ui/route-picker-modal';
import { ACCENT } from '@/shared/config/palette';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { Route } from '@/entities/route/model/route';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { useRoutesQuery } from '@/entities/route/model/routeHooks';
import { PERIODS } from '@/entities/ascent/lib/constants';
import { useAscentPeriodFilter } from '@/entities/ascent/lib/utilsAscent';

export function AscentsWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const user = useUserStore((s) => s.currentUser);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);

  const { data: ascents = [], isLoading, refetch } = useAscentsQuery();
  const { data: routes = [] } = useRoutesQuery({
    gymId: currentGymId ?? undefined,
    status: ['ACTIVE'],
  });

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const { activePeriod, setActivePeriod, periodAscents } = useAscentPeriodFilter(ascents);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRouteSelect = React.useCallback(
    (route: Route) => {
      setPickerVisible(false);
      router.push(`/ascent/${route.id}` as never);
    },
    [router]
  );

  return (
    <>
      <RoutePickerModal
        visible={pickerVisible}
        routes={routes}
        onClose={() => setPickerVisible(false)}
        onSelect={handleRouteSelect}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f2f2f7' }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }>
        <View style={{ gap: 16, paddingTop: 20 }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: isDark ? '#fff' : '#000',
                  letterSpacing: -0.5,
                }}>
                {t('ascents.title')}
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(128,128,128,0.7)', marginTop: 2 }}>
                {periodAscents.length} {t('ascents.periodCount')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={{
                backgroundColor: ACCENT,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}>
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                {t('ascents.addAscent')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Period filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {PERIODS.map((p) => (
              <FilterChip
                key={p.key}
                label={t(`ascents.period.${p.key}`)}
                active={activePeriod === p.key}
                onPress={() => setActivePeriod(p.key)}
                isDark={isDark}
              />
            ))}
          </ScrollView>

          <AscentsStats ascents={periodAscents} />

          <AscentsList ascents={periodAscents} isLoading={isLoading} />
        </View>
      </ScrollView>
    </>
  );
}
