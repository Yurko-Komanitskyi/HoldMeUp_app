import * as React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Users, Route as RouteIcon, TrendingUp, BarChart2, Map } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymMembersQuery } from '@/entities/gym-member/model/gymMemberHooks';
import { useGymRoutesInventoryQuery } from '@/entities/stats/model/statsHooks';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import { gymMemberKeys } from '@/entities/gym-member/api/gymMemberApi';
import { statsKeys } from '@/entities/stats/api/statsApi';
import { MemberRow } from '@/entities/gym-member/ui/member-row';
import { MetricCard } from '@/shared/ui/metric-card';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function GymStatsWidget() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);

  const currentGym = memberships.find((m) => m.gym.id === currentGymId)?.gym;

  const {
    data: members = [],
    refetch: refetchMembers,
    isError: membersError,
    error: membersQueryError,
  } = useGymMembersQuery(currentGymId ?? '');

  const {
    data: inventory,
    refetch: refetchInventory,
    isError: inventoryError,
    isLoading: inventoryLoading,
    error: inventoryQueryError,
  } = useGymRoutesInventoryQuery(currentGymId ?? undefined, { enabled: !!currentGymId });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (currentGymId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: gymMemberKeys.list(currentGymId) }),
          queryClient.invalidateQueries({ queryKey: statsKeys.gymInventory(currentGymId) }),
        ]);
        await Promise.all([
          queryClient.refetchQueries({ queryKey: gymMemberKeys.list(currentGymId), type: 'active' }),
          queryClient.refetchQueries({ queryKey: statsKeys.gymInventory(currentGymId), type: 'active' }),
        ]);
      }
      await Promise.all([refetchMembers(), refetchInventory()]);
    } finally {
      setRefreshing(false);
    }
  }, [currentGymId, queryClient, refetchMembers, refetchInventory]);

  const activeRoutes = inventory?.activeTotal ?? 0;
  const archivedRoutes = inventory?.archivedTotal ?? 0;
  const totalRoutes = inventory?.totalRoutes ?? 0;
  const bySector = inventory?.bySector ?? [];
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

  if (inventoryError && !inventoryLoading && inventory == null) {
    return (
      <View className="flex-1 bg-background">
        <View className="border-b border-border px-4 pb-4 pt-6">
          <Text variant="h3" className="text-foreground">
            {t('gymStats.title')}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">{currentGym.name}</Text>
        </View>
        <QueryErrorPanel
          error={inventoryQueryError ?? new Error('')}
          onRetry={() => void refetchInventory()}
        />
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

        {membersError ? (
          <View className="px-4">
            <QueryErrorPanel
              variant="compact"
              error={membersQueryError ?? new Error('')}
              onRetry={() => void refetchMembers()}
            />
          </View>
        ) : null}

        {/* Main Metrics */}
        <View className="gap-3 px-4">
          <View className="flex-row gap-3">
            <MetricCard
              icon={RouteIcon}
              value={activeRoutes}
              label={t('gymStats.activeRoutes')}
              sub={t('gymStats.totalRoutes', { total: totalRoutes })}
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
            <MetricCard icon={Map} value={bySector.length} label={t('gymStats.sectors')} />
            <MetricCard icon={TrendingUp} value={archivedRoutes} label={t('gymStats.archived')} />
          </View>
        </View>

        {/* Routes by sector breakdown */}
        {bySector.length > 0 && (
          <View className="px-4">
            <Text className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('gymStats.routesBySector')}
            </Text>
            <View className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {bySector.map((sector) => {
                const count = sector.activeRoutes + sector.archivedRoutes;
                const pct = totalRoutes > 0 ? Math.round((count / totalRoutes) * 100) : 0;
                return (
                  <View key={sector.sectorId} className="gap-2 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-foreground">
                        {sector.sectorName ?? sector.sectorId}
                      </Text>
                      <Text className="text-sm font-semibold text-primary">{count}</Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                      {t('gymStats.sectorRoutesBreakdown', {
                        active: sector.activeRoutes,
                        archived: sector.archivedRoutes,
                      })}
                    </Text>
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
