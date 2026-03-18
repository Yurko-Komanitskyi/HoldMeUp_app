import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';

import { LogAscentCta } from './log-ascent-cta';
import { WeekStats } from './week-stats';
import { FeaturedRoutes } from './featured-routes';
import { RecentAscents } from './recent-ascents';
import { RoutePickerModal } from '@/features/route-picker/ui/route-picker-modal';
import { Text } from '@/shared/ui/text';
import { Button } from '@/shared/ui/button';
import { ACCENT } from '@/shared/config/palette';
import { useHomeDashboard } from '@/features/home-dashboard/model/useHomeDashboard';
import type { Route } from '@/entities/route/model/route';
import { useUserStore } from '@/entities/user/model/userStore';
import { HomeUnlogin } from './home-unlogin';

export function HomeWidget() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((s) => s.currentUser);

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const {
    hasGym,
    ascents,
    routes,
    ascentsLoading,
    routesLoading,
    weekStats,
    refreshing,
    onRefresh,
  } = useHomeDashboard();

  const handleRouteSelect = React.useCallback(
    (route: Route) => {
      setPickerVisible(false);
      router.push(`/ascent/${route.id}` as never);
    },
    [router]
  );

  if (!user) {
    return <HomeUnlogin />;
  }

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
            <View
              style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40, gap: 16 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: ACCENT + '18',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Dumbbell size={38} color={ACCENT} />
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: isDark ? '#fff' : '#000',
                    textAlign: 'center',
                  }}>
                  Ще немає залу
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                  Приєднайся до залу, щоб бачити маршрути та відстежувати підйоми. Або попроси
                  адміна тебе додати.
                </Text>
              </View>
              <Button
                onPress={() => router.push('/gym/join' as never)}
                className="h-12 w-full"
                style={{ borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#000' : '#fff' }}>
                    Знайти зал
                  </Text>
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
