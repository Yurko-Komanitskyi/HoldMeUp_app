import * as React from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
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
import { useMyGymMembershipsQuery } from '@/entities/gym-member/model/gymMemberHooks';
import { HomeUnlogin } from './home-unlogin';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function HomeWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const user = useUserStore((s) => s.currentUser);

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const {
    hasGym,
    ascents,
    routes,
    ascentsLoading,
    ascentsError,
    ascentsQueryError,
    refetchAscents,
    routesLoading,
    routesError,
    routesQueryError,
    refetchRoutes,
    weekStats,
    weekStatsLoading,
    weekStatsError,
    weekStatsQueryError,
    refetchWeekStats,
    refreshing,
    onRefresh,
  } = useHomeDashboard();

  const {
    isError: membershipsError,
    error: membershipsQueryError,
    refetch: refetchMemberships,
  } = useMyGymMembershipsQuery();

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
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }>
        <View style={{ gap: 20, paddingTop: 16 }}>
          {membershipsError ? (
            <View style={{ paddingHorizontal: 16 }}>
              <QueryErrorPanel
                variant="compact"
                error={membershipsQueryError ?? new Error('')}
                onRetry={() => void refetchMemberships()}
              />
            </View>
          ) : null}
          {hasGym ? (
            <>
              <LogAscentCta onPress={() => setPickerVisible(true)} />
              {weekStatsError && !weekStatsLoading ? (
                <View style={{ paddingHorizontal: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      letterSpacing: 0.8,
                      color: colors.mutedForeground,
                      marginBottom: 12,
                    }}>
                    {t('home.weekStats').toUpperCase()}
                  </Text>
                  <QueryErrorPanel
                    variant="compact"
                    error={weekStatsQueryError ?? new Error('')}
                    onRetry={() => void refetchWeekStats()}
                  />
                </View>
              ) : (
                <WeekStats
                  total={weekStatsLoading ? '…' : weekStats.total}
                  success={weekStatsLoading ? '…' : weekStats.success}
                  flash={weekStatsLoading ? '…' : weekStats.flash}
                />
              )}
              {routesError && !routesLoading ? (
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
                      {t('home.featuredRoutes').toUpperCase()}
                    </Text>
                  </View>
                  <QueryErrorPanel
                    variant="compact"
                    error={routesQueryError ?? new Error('')}
                    onRetry={() => void refetchRoutes()}
                  />
                </View>
              ) : (
                <FeaturedRoutes routes={routes.slice(0, 3)} isLoading={routesLoading} />
              )}
              {ascentsError && !ascentsLoading ? (
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
                      {t('home.recentAscents').toUpperCase()}
                    </Text>
                  </View>
                  <QueryErrorPanel
                    variant="compact"
                    error={ascentsQueryError ?? new Error('')}
                    onRetry={() => void refetchAscents()}
                  />
                </View>
              ) : (
                <RecentAscents
                  ascents={ascents.slice(0, 4)}
                  isLoading={ascentsLoading}
                  onAddPress={() => setPickerVisible(true)}
                />
              )}
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
                    color: colors.foreground,
                    textAlign: 'center',
                  }}>
                  {t('home.noGymTitle')}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.mutedForeground,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                  {t('home.noGymBody')}
                </Text>
              </View>
              <Button
                onPress={() => router.push('/gym/join' as never)}
                className="h-12 w-full"
                style={{ borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.destructiveForeground,
                    }}>
                    {t('home.findGym')}
                  </Text>
                  <ChevronRight size={16} color={colors.destructiveForeground} />
                </View>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
