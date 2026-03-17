import * as React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Users, Route as RouteIcon, TrendingUp, BarChart2, Map } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymMembersQuery } from '@/entities/gym-member/model/useGymMembersQuery';
import { useRoutesQuery } from '@/entities/route/model/useRoutesQuery';
import { useSectorsQuery } from '@/entities/sector/model/useSectorsQuery';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import { MemberRow } from '@/entities/gym-member/ui/member-row';
import { MetricCard } from '@/shared/ui/metric-card';

export function GymStatsWidget() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);

  const currentGym = memberships.find((m) => m.gym.id === currentGymId)?.gym;

  const {
    data: members = [],
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useGymMembersQuery({ gymId: currentGymId ?? '', enabled: !!currentGymId });

  const {
    data: routes = [],
    isLoading: routesLoading,
    refetch: refetchRoutes,
  } = useRoutesQuery({ gymId: currentGymId ?? undefined }, !!currentGymId);

  const { data: sectors = [], isLoading: sectorsLoading } = useSectorsQuery(currentGymId);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMembers(), refetchRoutes()]);
    setRefreshing(false);
  }, [refetchMembers, refetchRoutes]);

  const activeRoutes = routes.filter((r) => r.status?.toLowerCase() === 'active').length;
  const customerCount = members.filter(
    (m) => m.role.toLowerCase() === GymMemberRole.CUSTOMER.toLowerCase()
  ).length;
  const staffCount = members.length - customerCount;

  const staffMembers = members.filter(
    (m) => m.role.toLowerCase() !== GymMemberRole.CUSTOMER.toLowerCase()
  );

  const iconColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  if (!currentGymId || !currentGym) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Icon as={BarChart2} size={48} color={iconColor} />
        <Text className="mt-4 text-lg font-semibold text-muted-foreground">
          {t('gymStats.selectGym')}
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          {t('gymStats.selectGymHint')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="gap-6 pt-6">
        {/* Header */}
        <View className="px-4">
          <Text variant="h3" className="text-foreground">
            {t('gymStats.title')}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">{currentGym.name}</Text>
        </View>

        {/* Main Metrics */}
        <View className="gap-3 px-4">
          <View className="flex-row gap-3">
            <MetricCard
              icon={RouteIcon}
              value={activeRoutes}
              label={t('gymStats.activeRoutes')}
              sub={t('gymStats.totalRoutes', { total: routes.length })}
              accent
            />
            <MetricCard
              icon={Users}
              value={customerCount}
              label={t('gymStats.clients')}
              sub={t('gymStats.staffCount', { count: staffCount })}
            />
          </View>
          <View className="flex-row gap-3">
            <MetricCard icon={Map} value={sectors.length} label={t('gymStats.sectors')} />
            <MetricCard
              icon={TrendingUp}
              value={routes.filter((r) => r.status === 'archived').length}
              label={t('gymStats.archived')}
            />
          </View>
        </View>

        {/* Routes by sector breakdown */}
        {sectors.length > 0 && (
          <View className="px-4">
            <Text className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('gymStats.routesBySector')}
            </Text>
            <View className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {sectors.map((sector) => {
                const count = routes.filter((r) => r.sectorId === sector.id).length;
                const pct = routes.length > 0 ? Math.round((count / routes.length) * 100) : 0;
                return (
                  <View key={sector.id} className="gap-2 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-foreground">{sector.name}</Text>
                      <Text className="text-sm font-semibold text-accent">{count}</Text>
                    </View>
                    <View className="h-1.5 w-full rounded-full bg-muted/40">
                      <View
                        className="h-1.5 rounded-full bg-accent/60"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Staff */}
        {staffMembers.length > 0 && (
          <View className="px-4">
            <Text className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('gymStats.staffSection', { count: staffMembers.length })}
            </Text>
            <View className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {staffMembers.slice(0, 10).map((m: any) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
