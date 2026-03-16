import * as React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Users, Route as RouteIcon, TrendingUp, BarChart2, Map } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { GymStatsWidget } from '@/widgets/gym-stats/ui/gym-stats-widget';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymMembersQuery } from '@/entities/gym-member/model/useGymMembersQuery';
import { useRoutesQuery } from '@/entities/route/model/useRoutesQuery';
import { useSectorsQuery } from '@/entities/sector/model/useSectorsQuery';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';

function MetricCard({
  icon,
  value,
  label,
  sub,
  accent,
}: {
  icon: React.ComponentType<any>;
  value: number | string;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  const iconColor = accent ? 'rgb(139, 153, 200)' : 'rgba(255,255,255,0.35)';
  return (
    <View
      className={`flex-1 rounded-2xl border p-4 ${accent ? 'bg-accent/8 border-accent/30' : 'border-border bg-card'}`}>
      <Icon as={icon} size={18} color={iconColor} />
      <Text className={`mt-3 text-2xl font-bold ${accent ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </Text>
      <Text className="text-xs font-medium text-foreground">{label}</Text>
      {sub && <Text className="mt-0.5 text-xs text-muted-foreground">{sub}</Text>}
    </View>
  );
}

function MemberRow({
  member,
}: {
  member: {
    id: string;
    user: { firstName: string | null; lastName: string | null; email: string | null };
    role: string;
  };
}) {
  const { t } = useTranslation();
  const roleBadge: Record<string, { label: string; color: string; bg: string }> = {
    owner: { label: t('gymStats.roles.owner'), color: 'text-accent', bg: 'bg-accent/10' },
    manager: { label: t('gymStats.roles.manager'), color: 'text-blue-400', bg: 'bg-blue-400/10' },
    setter: { label: t('gymStats.roles.setter'), color: 'text-purple-400', bg: 'bg-purple-400/10' },
    customer: {
      label: t('gymStats.roles.customer'),
      color: 'text-muted-foreground',
      bg: 'bg-muted/30',
    },
  };

  const badge = roleBadge[member.role.toLowerCase()] ?? {
    label: member.role,
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
  };

  const name =
    [member.user.firstName, member.user.lastName].filter(Boolean).join(' ') ||
    member.user.email ||
    t('gymStats.unknown');

  const initials =
    (
      (member.user.firstName?.charAt(0) ?? '') + (member.user.lastName?.charAt(0) ?? '')
    ).toUpperCase() || '?';

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View className="h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
        <Text className="text-xs font-bold text-accent">{initials}</Text>
      </View>
      <Text className="flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
        {name}
      </Text>
      <View className={`rounded-md px-2 py-0.5 ${badge.bg}`}>
        <Text className={`text-xs font-medium ${badge.color}`}>{badge.label}</Text>
      </View>
    </View>
  );
}

export default function GymStatsScreen() {
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

  const activeRoutes = routes.filter((r) => r.status === 'active').length;
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
              {staffMembers.slice(0, 10).map((m) => (
                <MemberRow key={m.id} member={m as any} />
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
  return <GymStatsWidget />;
}
