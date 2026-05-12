import * as React from 'react';
import { Pressable, View, ScrollView, RefreshControl } from 'react-native';
import { Dumbbell, ChevronRight, Trophy } from 'lucide-react-native';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';
import { useRouter } from 'expo-router';

import { WeekStats } from './week-stats';
import { FeaturedRoutes } from './featured-routes';
import { RecentAscents } from './recent-ascents';
import { AscentFeedSection } from './ascent-feed-section';
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
  const homeScrollRef = useScrollToTopOnFocus<ScrollView>();
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
        ref={homeScrollRef}
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
              <AscentFeedSection />
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
              {/* Leaderboard — картка в стилі додатку */}
              <Pressable
                onPress={() => router.push('/leaderboard' as never)}
                style={({ pressed }) => ({
                  marginHorizontal: 20,
                  borderRadius: 22,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                  opacity: pressed ? 0.92 : 1,
                  minHeight: 128,
                  shadowColor: '#261d17',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: colors.isDark ? 0.35 : 0.06,
                  shadowRadius: 12,
                  elevation: 3,
                })}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: ACCENT,
                    opacity: 0.85,
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'stretch', flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      paddingLeft: 26,
                      paddingVertical: 20,
                      paddingRight: 12,
                      gap: 8,
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: colors.secondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Trophy size={18} color={colors.primary} strokeWidth={2.2} />
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color: colors.mutedForeground,
                          letterSpacing: 1.3,
                        }}
                      >
                        РЕЙТИНГ ЗАЛУ
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '900',
                        color: colors.foreground,
                        lineHeight: 25,
                      }}
                    >
                      Хто лідирує{'\n'}цього місяця?
                    </Text>
                    <View
                      style={{
                        marginTop: 2,
                        alignSelf: 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: ACCENT }}>Переглянути</Text>
                      <ChevronRight size={15} color={ACCENT} strokeWidth={2.5} />
                    </View>
                  </View>

                  <View
                    style={{
                      width: 108,
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 16,
                      paddingBottom: 14,
                      backgroundColor: colors.secondary,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
                      <View style={{ alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: ACCENT + '35',
                          }}
                        />
                        <View
                          style={{
                            width: 26,
                            height: 40,
                            borderRadius: 6,
                            backgroundColor: ACCENT + '28',
                          }}
                        />
                      </View>
                      <View style={{ alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: ACCENT + '55',
                          }}
                        />
                        <View
                          style={{
                            width: 28,
                            height: 56,
                            borderRadius: 6,
                            backgroundColor: ACCENT + '40',
                          }}
                        />
                      </View>
                      <View style={{ alignItems: 'center', gap: 4 }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: ACCENT + '30',
                          }}
                        />
                        <View
                          style={{
                            width: 26,
                            height: 28,
                            borderRadius: 6,
                            backgroundColor: ACCENT + '22',
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>

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
