import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';
import type { GymMember } from '@/entities/gym-member/model/gym-member';

type Props = {
  member: GymMember;
};

export function MemberRow({ member }: Props) {
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
          {member.role}
        </Text>
      </View>
    </View>
  );
}

