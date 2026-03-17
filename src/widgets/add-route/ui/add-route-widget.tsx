import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { createRoute, routeKeys } from '@/entities/route/api/routeApi';
import {
  RouteFormWidget,
  type RouteFormSubmitData,
} from '@/widgets/route-form/ui/route-form-widget';

export function AddRouteWidget() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useUserStore((s) => s.currentUser);
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const currentGym = memberships.find((m) => m.gym.id === currentGymId)?.gym;

  const { mutateAsync } = useMutation({ mutationFn: createRoute });

  async function handleSubmit(data: RouteFormSubmitData) {
    const height = data.height ? parseFloat(data.height) : null;
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];
    const newRoute = await mutateAsync({
      name: data.name,
      grade: data.grade,
      color: data.color,
      sectorId: data.sectorId,
      setterId: user!.id,
      description: data.description?.trim() || null,
      height: Number.isNaN(height as number) ? null : height,
      status: data.status,
      photoUrl: data.photoUrl?.trim() || null,
      holdTypes: data.holdTypes,
      tags,
      annotationData: data.annotationData ? JSON.stringify(data.annotationData) : null,
    });
    queryClient.invalidateQueries({ queryKey: routeKeys.all });
    router.push(`/route/${newRoute.id}` as never);
  }

  return (
    <RouteFormWidget
      subtitle={currentGym?.name}
      submitLabel="Додати маршрут"
      onSubmitForm={handleSubmit}
    />
  );
}
