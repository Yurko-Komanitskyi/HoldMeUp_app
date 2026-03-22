import type { TFunction } from 'i18next';

import { GymMemberRole } from '@/entities/gym-member/model/gym-member';

const ROLE_TO_KEY: Record<
  string,
  'gym.roleOwner' | 'gym.roleManager' | 'gym.roleSetter' | 'gym.roleCustomer'
> = {
  [GymMemberRole.OWNER]: 'gym.roleOwner',
  [GymMemberRole.MANAGER]: 'gym.roleManager',
  [GymMemberRole.SETTER]: 'gym.roleSetter',
  [GymMemberRole.CUSTOMER]: 'gym.roleCustomer',
};

export function formatGymMemberRoleLabel(role: string, t: TFunction): string {
  const key = ROLE_TO_KEY[role];
  return key ? String(t(key)) : role;
}
