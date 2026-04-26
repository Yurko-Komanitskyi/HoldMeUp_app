import * as React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Users } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymManage } from '@/features/gym-memberships/model/useGymManage';
import { MembershipCard } from '@/features/gym-memberships/ui/membership-card';
import { JoinableGymCard } from '@/features/gym-join/ui/joinable-gym-card';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToastStore } from '@/shared/ui/app-toast';

function SectionTitle({ title }: { title: string }) {
  const { mutedForeground } = useThemeColor();
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: mutedForeground,
        marginBottom: 8,
      }}>
      {title}
    </Text>
  );
}

export function GymManageWidget() {
  const { t } = useTranslation();
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const colors = useThemeColor();
  const isDark = colors.isDark;
  const toast = useToastStore();

  const [leaveTarget, setLeaveTarget] = React.useState<{ id: string; name: string } | null>(null);

  const memberships    = useGymMemberStore((s) => s.memberships);
  const {
    availableGyms,
    gymsLoading: isLoading,
    gymsQueryError,
    gymsQueryErrorDetail,
    refetch: refetchJoinableGyms,
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
    setLeaveTarget({ id: gymId, name: gymName });
  }

  async function handleLeaveConfirm() {
    if (!leaveTarget) return;
    try {
      const remainingCount = await leaveGym(leaveTarget.id);
      setLeaveTarget(null);
      if (remainingCount === 0) {
        router.replace('/gym/join' as never);
      }
    } catch (e) {
      setLeaveTarget(null);
      const message = e instanceof Error ? e.message : t('gym.leaveGymFailed');
      toast.show('error', message);
    }
  }

  async function handleJoin(gymId: string) {
    try {
      await joinGym(gymId);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('gym.joinGymFailed');
      toast.show('error', message);
    }
  }

  const bgColor = colors.background;
  const textColor = colors.foreground;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ConfirmDialog
        visible={!!leaveTarget}
        title={t('gym.leaveTitle')}
        message={leaveTarget ? t('gym.leaveMessage', { name: leaveTarget.name }) : undefined}
        confirmLabel={t('gym.leaveGym')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={!!leavingId}
        onConfirm={() => void handleLeaveConfirm()}
        onCancel={() => setLeaveTarget(null)}
      />
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 14,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>{t('gym.manageTitle')}</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}>

        {memberships.length > 0 && (
          <View style={{ gap: 10 }}>
            <SectionTitle title={t('gym.manageSection')} />
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
          <SectionTitle title={t('gym.availableSection')} />
          {gymsQueryError && !isLoading ? (
            <QueryErrorPanel
              variant="compact"
              error={gymsQueryErrorDetail ?? new Error('')}
              onRetry={() => void refetchJoinableGyms()}
            />
          ) : isLoading ? (
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
                {t('gym.noMoreToJoin')}
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
            {t('gym.footerHint')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
