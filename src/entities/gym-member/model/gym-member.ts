import type { Gym } from '@/entities/gym';
import type { User } from '@/entities/user';

export const GymMemberRole = {
  OWNER: 'OWNER',
  SETTER: 'SETTER',
  MANAGER: 'MANAGER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type GymMemberRoleType = (typeof GymMemberRole)[keyof typeof GymMemberRole];

export interface GymMember {
  id: string;
  role: GymMemberRoleType | string;
  user: User;
  gym: Gym;
  createdAt: Date;
  updatedAt: Date;
}
