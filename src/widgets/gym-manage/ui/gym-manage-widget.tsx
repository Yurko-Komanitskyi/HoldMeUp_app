import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Users } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymManage } from '@/features/gym-memberships/model/useGymManage';
import { MembershipCard } from '@/features/gym-memberships/ui/membership-card';
import { JoinableGymCard } from '@/features/gym-join/ui/joinable-gym-card';

function SectionTitle({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: 8 }}>
      {title}
    </Text>
  );
}

export function GymManageWidget() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const memberships    = useGymMemberStore((s) => s.memberships);
  const {
    availableGyms,
    gymsLoading: isLoading,
    leavingId,
    joiningId,
    joinedIds,
    joinErrors,
    refreshing,
    leaveGym,
    joinGym,
    onRefresh,
  } = useGymManage();

  function handleLeave(gymId: string, gymName: string) {
    Alert.alert(
      'Вийти з залу',
      `Ви впевнені, що хочете вийти з "${gymName}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            try {
              const remainingCount = await leaveGym(gymId);
              if (remainingCount === 0) {
                router.replace('/gym/join' as never);
              }
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Не вдалося вийти із залу';
              Alert.alert('Помилка', message);
            }
          },
        },
      ]
    );
  }

  async function handleJoin(gymId: string) {
    try {
      await joinGym(gymId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не вдалося приєднатися до залу';
      Alert.alert('Помилка', message);
    }
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
                leaving={leavingId === m.gym.id}
                onLeavePress={handleLeave}
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
