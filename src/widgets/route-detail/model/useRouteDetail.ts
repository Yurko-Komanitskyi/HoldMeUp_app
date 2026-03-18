import * as React from 'react';
import { useRouteDetailsQuery } from '@/entities/route/model/routeHooks';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { AnnotationData } from '@/features/route-annotation';
import { STYLE_LABELS } from '@/entities/route/lib/constants';

const STATUS_MAP = {
  active: { label: 'Активний', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  archived: { label: 'Архів', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  draft: { label: 'Чернетка', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
} as const;

export function useRouteDetail(id: string) {
  const { data: route, isLoading, isError, refetch } = useRouteDetailsQuery(id);
  const user = useUserStore((s) => s.currentUser);
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);

  const canManageRoute = React.useMemo(() => {
    if (!user || !route) return false;
    if (route.setter?.id === user.id) return true;
    const role = memberships.find((m) => m.gym.id === currentGymId)?.role?.toUpperCase();
    return role === 'OWNER' || role === 'MANAGER' || role === 'SETTER';
  }, [user, route, memberships, currentGymId]);

  const parsedAnnotation = React.useMemo<AnnotationData | null>(() => {
    if (!route?.annotationData) return null;
    if (typeof route.annotationData === 'string') {
      try {
        return JSON.parse(route.annotationData) as AnnotationData;
      } catch {
        return null;
      }
    }
    return route.annotationData as AnnotationData;
  }, [route?.annotationData]);

  const status =
    STATUS_MAP[route?.status?.toLowerCase() as keyof typeof STATUS_MAP] ?? STATUS_MAP.active;

  const styleLabel =
    route?.style != null
      ? STYLE_LABELS[route.style.toLowerCase()] ?? route.style
      : null;

  const setterName = route?.setter
    ? `${route.setter.firstName ?? ''} ${route.setter.lastName ?? ''}`.trim() || 'Невідомо'
    : 'Невідомо';

  const flashRate =
    route?.ascentCount && route.flashCount
      ? Math.round((route.flashCount / route.ascentCount) * 100)
      : null;

  const rating = route?.communityRating ? route.communityRating.toFixed(1) : null;

  const addedDate = route?.createdAt
    ? new Date(route.createdAt).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return {
    route,
    isLoading,
    isError,
    refetch,
    canManageRoute,
    status,
    styleLabel,
    setterName,
    flashRate,
    rating,
    addedDate,
    parsedAnnotation,
  };
}
