import * as React from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  Dumbbell,
  Crown,
  ShieldCheck,
  Wrench,
  Users,
  ChevronRight,
  CalendarDays,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useGymDetailsQuery } from '@/entities/gym/model/gymHooks';
import { useGymMembersQuery } from '@/entities/gym-member/model/gymMemberHooks';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { formatGymMemberRoleLabel } from '@/entities/gym-member/lib/gym-role-i18n';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

const ROLE_COLOR: Record<string, string> = {
  [GymMemberRole.OWNER]: '#F59E0B',
  [GymMemberRole.MANAGER]: ACCENT,
  [GymMemberRole.SETTER]: '#10B981',
};

const ROLE_ICON: Record<string, React.ElementType> = {
  [GymMemberRole.OWNER]: Crown,
  [GymMemberRole.MANAGER]: ShieldCheck,
  [GymMemberRole.SETTER]: Wrench,
};

interface StatPillProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colors: ReturnType<typeof useThemeColor>;
}

function StatPill({ label, value, icon: Icon, colors }: StatPillProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 5,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 18,
        backgroundColor: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)',
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <Icon size={16} color={ACCENT} />
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}>{value}</Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.mutedForeground,
          fontWeight: '600',
          letterSpacing: 0.2,
          textAlign: 'center',
        }}>
        {label}
      </Text>
    </View>
  );
}

export function GymDetailWidget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const isDark = colors.isDark;

  const memberships = useGymMemberStore((s) => s.memberships);
  const myMembership = memberships.find((m) => m.gym.id === id);

  const {
    data: gym,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGymDetailsQuery(id ?? '');

  const { data: members } = useGymMembersQuery(id ?? '');

  const staffMembers = React.useMemo(
    () =>
      (members ?? []).filter(
        (m) =>
          m.role === GymMemberRole.OWNER ||
          m.role === GymMemberRole.MANAGER ||
          m.role === GymMemberRole.SETTER
      ),
    [members]
  );

  const myRoleColor = myMembership ? (ROLE_COLOR[myMembership.role] ?? ACCENT) : ACCENT;
  const MyRoleIcon = myMembership ? (ROLE_ICON[myMembership.role] ?? Dumbbell) : Dumbbell;
  const createdYear = gym?.createdAt ? new Date(gym.createdAt).getFullYear() : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ padding: 6, borderRadius: 12, backgroundColor: colors.secondary }}>
          <ChevronLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text
          style={{ fontSize: 17, fontWeight: '700', color: colors.foreground, flex: 1 }}
          numberOfLines={1}>
          {gym?.name ?? t('gym.detailTitle')}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <QueryErrorPanel error={error} onRetry={() => void refetch()} />
        </View>
      ) : !gym ? null : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: insets.bottom + 48,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={ACCENT}
            />
          }>
          {/* Hero card */}
          <View style={{ borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(123,173,207,0.18)', 'rgba(123,173,207,0.05)']
                  : ['rgba(123,173,207,0.22)', 'rgba(123,173,207,0.07)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 28,
                alignItems: 'center',
                gap: 14,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(123,173,207,0.22)' : 'rgba(123,173,207,0.32)',
                borderRadius: 24,
              }}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 26,
                  backgroundColor: ACCENT + '28',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: ACCENT + '45',
                }}>
                <Dumbbell size={38} color={ACCENT} />
              </View>

              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: colors.foreground,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                  }}>
                  {gym.name}
                </Text>

                {gym.address ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} color={colors.mutedForeground} />
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.mutedForeground,
                        textAlign: 'center',
                      }}>
                      {gym.address}
                    </Text>
                  </View>
                ) : null}

                {myMembership ? (
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 99,
                      backgroundColor: myRoleColor + '22',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderWidth: 1,
                      borderColor: myRoleColor + '38',
                      marginTop: 4,
                    }}>
                    <MyRoleIcon size={12} color={myRoleColor} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: myRoleColor }}>
                      {formatGymMemberRoleLabel(myMembership.role, t)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>
          </View>

          {/* Quick stats */}
          {members !== undefined && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatPill
                label={t('gym.members')}
                value={members.length}
                icon={Users}
                colors={colors}
              />
              <StatPill
                label={t('gym.staff')}
                value={staffMembers.length}
                icon={ShieldCheck}
                colors={colors}
              />
              {createdYear ? (
                <StatPill
                  label={t('gym.since', { year: createdYear })}
                  value={String(createdYear)}
                  icon={CalendarDays}
                  colors={colors}
                />
              ) : null}
            </View>
          )}

          {/* Browse routes CTA */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/' as never)}
            activeOpacity={0.85}
            style={{ borderRadius: 18, overflow: 'hidden' }}>
            <LinearGradient
              colors={[ACCENT, '#5a9bbf']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 17,
                paddingHorizontal: 20,
                gap: 12,
                borderRadius: 18,
              }}>
              <Dumbbell size={18} color="#fff" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 }}>
                {t('gym.browseRoutes')}
              </Text>
              <ChevronRight size={17} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Description */}
          {gym.description ? (
            <View
              style={{
                borderRadius: 18,
                padding: 18,
                gap: 10,
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.mutedForeground,
                }}>
                {t('gym.description')}
              </Text>
              <Text style={{ fontSize: 15, color: colors.foreground, lineHeight: 23 }}>
                {gym.description}
              </Text>
            </View>
          ) : null}

          {/* Staff */}
          {staffMembers.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.mutedForeground,
                }}>
                {t('gym.staff')}
              </Text>
              {staffMembers.map((m) => {
                const RoleIcon = ROLE_ICON[m.role] ?? Dumbbell;
                const roleColor = ROLE_COLOR[m.role] ?? ACCENT;
                const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(' ');
                const initials =
                  [m.user.firstName, m.user.lastName]
                    .filter(Boolean)
                    .map((s) => s![0])
                    .join('')
                    .toUpperCase() || '?';
                return (
                  <View
                    key={m.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: roleColor + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: roleColor + '38',
                      }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: roleColor }}>
                        {initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                        {name || m.user.email || '?'}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          marginTop: 3,
                        }}>
                        <RoleIcon size={12} color={roleColor} />
                        <Text style={{ fontSize: 12, color: roleColor, fontWeight: '600' }}>
                          {formatGymMemberRoleLabel(m.role, t)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
