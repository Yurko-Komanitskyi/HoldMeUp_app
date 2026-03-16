import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

import { LogAscentCta } from '@/widgets/home/ui/log-ascent-cta';
import { WeekStats } from '@/widgets/home/ui/week-stats';
import { FeaturedRoutes } from '@/widgets/home/ui/featured-routes';
import { RecentAscents } from '@/widgets/home/ui/recent-ascents';
import { RoutePickerModal } from '@/features/route-picker/ui/route-picker-modal';
import { Text } from '@/shared/ui/text';
import { Button } from '@/shared/ui/button';
import { ACCENT } from '@/shared/config/palette';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useAscentsQuery } from '@/entities/ascent/model/useAscentsQuery';
import { useRoutesQuery } from '@/entities/route/model/useRoutesQuery';
import type { Route } from '@/entities/route/model/route';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function HomeWidget() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const user         = useUserStore((s) => s.currentUser);
  const currentGymId   = useGymMemberStore((s) => s.currentGymId);
  const memberships    = useGymMemberStore((s) => s.memberships);
  const hasGym         = memberships.length > 0 || !!currentGymId;

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: ascents = [], isLoading: ascentsLoading, refetch } = useAscentsQuery(!!user);
  const { data: routes = [], isLoading: routesLoading } = useRoutesQuery(
    { gymId: currentGymId ?? undefined, status: ['ACTIVE'] },
    !!user && !!currentGymId
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const weekStats = React.useMemo(() => {
    const cutoff = new Date(Date.now() - ONE_WEEK_MS);
    const week = ascents.filter((a) => new Date(a.date) >= cutoff);
    return {
      total:   week.length,
      success: week.filter((a) => a.success).length,
      flash:   week.filter((a) => a.type?.toUpperCase() === 'FLASH').length,
    };
  }, [ascents]);

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
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }>
        <View style={{ gap: 20, paddingTop: 16 }}>
          {hasGym ? (
            <>
              <LogAscentCta onPress={() => setPickerVisible(true)} />
              <WeekStats
                total={ascentsLoading ? '…' : weekStats.total}
                success={ascentsLoading ? '…' : weekStats.success}
                flash={ascentsLoading ? '…' : weekStats.flash}
              />
              <FeaturedRoutes routes={routes.slice(0, 3)} isLoading={routesLoading} />
              <RecentAscents
                ascents={ascents.slice(0, 4)}
                isLoading={ascentsLoading}
                onAddPress={() => setPickerVisible(true)}
              />
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40, gap: 16 }}>
              <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell size={38} color={ACCENT} />
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#fff' : '#000', textAlign: 'center' }}>
                  Ще немає залу
                </Text>
                <Text style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 20 }}>
                  Приєднайся до залу, щоб бачити маршрути та відстежувати підйоми. Або попроси адміна тебе додати.
                </Text>
              </View>
              <Button
                onPress={() => router.push('/gym/join' as never)}
                className="h-12 w-full"
                style={{ borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#000' : '#fff' }}>Знайти зал</Text>
                  <ChevronRight size={16} color={isDark ? '#000' : '#fff'} />
                </View>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
