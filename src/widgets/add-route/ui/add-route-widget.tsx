import { View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { createRoute, routeKeys } from '@/entities/route/api/routeApi';
import { routeStyleFormToApi } from '@/entities/route/lib/route-style-api';
import { RouteFormWidget } from '@/widgets/route-form/ui/route-form-widget';
import type { RouteFormSubmitData } from '@/widgets/edit-route/ui/useRouteForm';
import { parseApiError } from '@/shared/lib/api-error';
import { useToastStore } from '@/shared/ui/app-toast';

export function AddRouteWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useUserStore((s) => s.currentUser);
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);
  const currentGym = memberships.find((m) => m.gym.id === currentGymId)?.gym;
  const toast = useToastStore();

  const { mutateAsync } = useMutation({ mutationFn: createRoute });

  async function handleSubmit(data: RouteFormSubmitData) {
    try {
      const height = data.height ? parseFloat(data.height) : null;
      const tags = data.tags
        ? data.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: data.name,
        grade: data.grade,
        color: data.color,
        sectorId: data.sectorId,
        setterId: user!.id,
        style: routeStyleFormToApi(data.style ?? undefined),
        description: data.description?.trim() || null,
        height: Number.isNaN(height as number) ? null : height,
        status: data.status,
        photoUrl: data.photoUrl?.trim() || null,
        holdTypes: data.holdTypes,
        tags,
        annotation: data.annotationData ? JSON.stringify(data.annotationData) : null,
      };

      if (__DEV__) {
        console.log('[AddRoute] submit payload', payload);
      }

      const newRoute = await mutateAsync(payload);

      if (__DEV__) {
        console.log('[AddRoute] created route', { id: newRoute.id, name: newRoute.name });
      }

      toast.show('success', t('routeForm.createSuccess'));
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
      await new Promise((resolve) => setTimeout(resolve, 450));
      router.push(`/route/${newRoute.id}` as never);
    } catch (error) {
      const parsed = parseApiError(error);
      console.error('[AddRoute] create failed', parsed.message, error);
      throw error;
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <RouteFormWidget
        subtitle={currentGym?.name}
        submitLabel={t('routeForm.addRoute')}
        onSubmitForm={handleSubmit}
      />
    </View>
  );
}
