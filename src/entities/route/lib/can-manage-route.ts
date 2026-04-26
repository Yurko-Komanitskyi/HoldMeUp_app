import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import type { Route } from '@/entities/route/model/route';

export function computeCanManageRoute(
  user: { id: string } | null | undefined,
  route: Route | undefined,
  memberships: { gym: { id: string }; role: string }[],
  currentGymId: string | null | undefined
): boolean {
  if (!user || !route) return false;
  if (route.setter?.id === user.id) return true;
  const gymId = route.sector?.gymId ?? currentGymId ?? undefined;
  if (!gymId) return false;
  const role = memberships.find((m) => m.gym.id === gymId)?.role?.toUpperCase();
  return (
    role === GymMemberRole.OWNER || role === GymMemberRole.MANAGER || role === GymMemberRole.SETTER
  );
}

export function useCanManageRoute(route: Route | undefined): boolean {
  const user = useUserStore((s) => s.currentUser);
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  return computeCanManageRoute(user, route, memberships, currentGymId);
}
