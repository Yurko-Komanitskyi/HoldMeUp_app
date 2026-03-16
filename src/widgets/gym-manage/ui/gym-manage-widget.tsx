import * as React from 'react';
import {
  View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dumbbell, MapPin, LogOut, Plus, CheckCircle, Users,
  ShieldCheck, Wrench, Crown, User,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { parseApiError } from '@/shared/lib/api-error';
import { ACCENT } from '@/shared/config/palette';
import { fetchAutoJoinGyms, gymKeys, joinGym } from '@/entities/gym/api/gymApi';
import { gymMemberKeys, leaveGym } from '@/entities/gym-member/api/gymMemberApi';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole, type GymMember } from '@/entities/gym-member/model/gym-member';

const ROLE_LABEL: Record<string, string> = {
  [GymMemberRole.OWNER]:    'Власник',
  [GymMemberRole.MANAGER]:  'Менеджер',
  [GymMemberRole.SETTER]:   'Постановник',
  [GymMemberRole.CUSTOMER]: 'Учасник',
};

const ROLE_ICON: Record<string, React.ElementType> = {
  [GymMemberRole.OWNER]:    Crown,
  [GymMemberRole.MANAGER]:  ShieldCheck,
  [GymMemberRole.SETTER]:   Wrench,
  [GymMemberRole.CUSTOMER]: User,
};

function SectionTitle({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: 8 }}>
      {title}
    </Text>
  );
}

function MembershipCard({
  membership, isDark, onLeave, leaving,
}: {
  membership: GymMember;
  isDark: boolean;
  onLeave: (gymId: string, gymName: string) => void;
  leaving: boolean;
}) {
  const RoleIcon = ROLE_ICON[membership.role] ?? User;
  const isOwner  = membership.role === GymMemberRole.OWNER;

  return (
    <View style={{
      borderRadius: 18, borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
      padding: 16, gap: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: ACCENT + '18', alignItems: 'center', justifyContent: 'center',
        }}>
          <Dumbbell size={22} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {membership.gym.name}
          </Text>
          {membership.gym.address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', flex: 1 }} numberOfLines={1}>
                {membership.gym.address}
              </Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <RoleIcon size={12} color={ACCENT} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT }}>
              {ROLE_LABEL[membership.role] ?? membership.role}
            </Text>
          </View>
        </View>

        {!isOwner && (
          <TouchableOpacity
            onPress={() => onLeave(membership.gym.id, membership.gym.name)}
            disabled={leaving}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              alignItems: 'center', justifyContent: 'center',
            }}>
            {leaving
              ? <ActivityIndicator size="small" color="#ef4444" />
              : <LogOut size={15} color="#ef4444" />
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function JoinableGymCard({
  gymId, name, address, description, isDark,
  onJoin, joining, joined, error,
}: {
  gymId: string; name: string; address?: string | null;
  description?: string | null; isDark: boolean;
  onJoin: (id: string) => void; joining: boolean; joined: boolean; error?: string | null;
}) {
  return (
    <View style={{
      borderRadius: 18, borderWidth: 1,
      borderColor: joined ? ACCENT + '50' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      backgroundColor: joined ? ACCENT + '06' : isDark ? 'rgba(255,255,255,0.04)' : '#fff',
      padding: 16, gap: 10,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: ACCENT + '15', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Dumbbell size={20} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>{name}</Text>
          {address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', flex: 1 }} numberOfLines={1}>{address}</Text>
            </View>
          ) : null}
          {description ? (
            <Text style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', marginTop: 2 }} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {error ? <Text style={{ fontSize: 12, color: '#ef4444' }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={() => !joined && onJoin(gymId)}
        disabled={joining || joined}
        style={{
          height: 40, borderRadius: 12,
          backgroundColor: joined ? ACCENT + '15' : ACCENT,
          alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
          opacity: joining ? 0.7 : 1,
        }}>
        {joining ? (
          <ActivityIndicator size="small" color={joined ? ACCENT : '#fff'} />
        ) : joined ? (
          <>
            <CheckCircle size={14} color={ACCENT} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>Приєднались!</Text>
          </>
        ) : (
          <>
            <Plus size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Приєднатись</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function GymManageWidget() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const memberships    = useGymMemberStore((s) => s.memberships);
  const currentGymId   = useGymMemberStore((s) => s.currentGymId);
  const setCurrentGymId = useGymMemberStore((s) => s.setCurrentGymId);

  const memberGymIds = new Set(memberships.map((m) => m.gym.id));

  const [leavingId,  setLeavingId]  = React.useState<string | null>(null);
  const [joiningId,  setJoiningId]  = React.useState<string | null>(null);
  const [joinedIds,  setJoinedIds]  = React.useState<Set<string>>(new Set());
  const [joinErrors, setJoinErrors] = React.useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: autoJoinGyms = [], isLoading, refetch } = useQuery({
    queryKey: gymKeys.autoJoin(),
    queryFn: fetchAutoJoinGyms,
    staleTime: 5 * 60 * 1000,
  });

  const availableGyms = autoJoinGyms.filter((g) => !memberGymIds.has(g.id) && !joinedIds.has(g.id));

  async function doLeave(gymId: string) {
    setLeavingId(gymId);
    try {
      await leaveGym(gymId);
      await queryClient.invalidateQueries({ queryKey: gymMemberKeys.all });
      const updatedMemberships = useGymMemberStore.getState().memberships;
      const remaining = updatedMemberships.filter((m) => m.gym.id !== gymId);
      if (currentGymId === gymId) {
        const nextGymId = remaining.length > 0 ? remaining[0].gym.id : null;
        setCurrentGymId(nextGymId);
      }
      if (remaining.length === 0) {
        router.replace('/gym/join' as never);
      }
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      Alert.alert('Помилка', message);
    } finally {
      setLeavingId(null);
    }
  }

  function handleLeave(gymId: string, gymName: string) {
    Alert.alert(
      'Вийти з залу',
      `Ви впевнені, що хочете вийти з "${gymName}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Вийти', style: 'destructive', onPress: () => { void doLeave(gymId); } },
      ]
    );
  }

  async function handleJoin(gymId: string) {
    setJoiningId(gymId);
    setJoinErrors((prev) => { const n = { ...prev }; delete n[gymId]; return n; });
    try {
      await joinGym(gymId);
      setJoinedIds((prev) => new Set([...prev, gymId]));
      await queryClient.invalidateQueries({ queryKey: gymMemberKeys.all });
      if (!currentGymId) setCurrentGymId(gymId);
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      setJoinErrors((prev) => ({ ...prev, [gymId]: message }));
    } finally {
      setJoiningId(null);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const bgColor  = isDark ? '#000' : '#f2f2f7';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 14,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            alignItems: 'center', justifyContent: 'center',
          }}>
          <ChevronLeft size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>Мої зали</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}>

        {memberships.length > 0 && (
          <View style={{ gap: 10 }}>
            <SectionTitle title="Мої зали" isDark={isDark} />
            {memberships.map((m) => (
              <MembershipCard
                key={m.id}
                membership={m}
                isDark={isDark}
                onLeave={handleLeave}
                leaving={leavingId === m.gym.id}
              />
            ))}
          </View>
        )}

        <View style={{ gap: 10 }}>
          <SectionTitle title="Доступні зали" isDark={isDark} />
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <ActivityIndicator color={ACCENT} />
            </View>
          ) : availableGyms.length === 0 ? (
            <View style={{
              padding: 20, borderRadius: 16, alignItems: 'center', gap: 8,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}>
              <Text style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
                Більше залів для приєднання немає
              </Text>
            </View>
          ) : (
            availableGyms.map((gym) => (
              <JoinableGymCard
                key={gym.id}
                gymId={gym.id}
                name={gym.name}
                address={gym.address}
                description={gym.description}
                isDark={isDark}
                onJoin={handleJoin}
                joining={joiningId === gym.id}
                joined={joinedIds.has(gym.id)}
                error={joinErrors[gym.id]}
              />
            ))
          )}
        </View>

        <View style={{
          padding: 16, borderRadius: 16,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        }}>
          <Users size={18} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Якщо вашого залу немає у списку — попросіть адміна залу вас додати вручну
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
