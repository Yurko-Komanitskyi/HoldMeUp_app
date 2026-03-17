import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, MapPin, LogOut, ShieldCheck, Wrench, Crown, User } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { GymMemberRole, type GymMember } from '@/entities/gym-member/model/gym-member';

const ROLE_LABEL: Record<string, string> = {
  [GymMemberRole.OWNER]: 'Власник',
  [GymMemberRole.MANAGER]: 'Менеджер',
  [GymMemberRole.SETTER]: 'Постановник',
  [GymMemberRole.CUSTOMER]: 'Учасник',
};

const ROLE_ICON: Record<string, React.ElementType> = {
  [GymMemberRole.OWNER]: Crown,
  [GymMemberRole.MANAGER]: ShieldCheck,
  [GymMemberRole.SETTER]: Wrench,
  [GymMemberRole.CUSTOMER]: User,
};

interface Props {
  membership: GymMember;
  isDark: boolean;
  leaving: boolean;
  onLeavePress: (gymId: string, gymName: string) => void;
}

export function MembershipCard({ membership, isDark, leaving, onLeavePress }: Props) {
  const RoleIcon = ROLE_ICON[membership.role] ?? User;
  const isOwner = membership.role === GymMemberRole.OWNER;

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        padding: 16,
        gap: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: ACCENT + '18',
            alignItems: 'center',
            justifyContent: 'center',
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
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                  flex: 1,
                }}
                numberOfLines={1}>
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
            onPress={() => onLeavePress(membership.gym.id, membership.gym.name)}
            disabled={leaving}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {leaving ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <LogOut size={15} color="#ef4444" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

