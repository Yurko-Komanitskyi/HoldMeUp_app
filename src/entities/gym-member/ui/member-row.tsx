import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import type { GymMember } from '@/entities/gym-member/model/gym-member';
import { formatGymMemberRoleLabel } from '@/entities/gym-member/lib/gym-role-i18n';

type Props = {
  member: GymMember;
};

export function MemberRow({ member }: Props) {
  const { t } = useTranslation();
  const name =
    member.user?.firstName || member.user?.lastName
      ? `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim()
      : member.user?.email ?? '—';

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {name}
        </Text>
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
          {formatGymMemberRoleLabel(member.role, t)}
        </Text>
      </View>
    </View>
  );
}

