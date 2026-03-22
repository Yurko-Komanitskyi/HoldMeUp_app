import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteDetailsQuery } from '@/entities/route/model/routeHooks';
import type { Route } from '@/entities/route/model/route';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import type { AnnotationData } from '@/features/route-annotation';
import { getRouteStyleLabel } from '@/entities/route/lib/route-style';
import i18n from '@/shared/lib/i18n';

const STATUS_MAP = {
  active: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  archived: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  draft: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
} as const;

function computeCanManageRoute(
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

export function useRouteDetail(id: string) {
  const { t } = useTranslation();
  const { data: route, isLoading, isError, error, refetch } = useRouteDetailsQuery(id);
  const user = useUserStore((s) => s.currentUser);
  const memberships = useGymMemberStore((s) => s.memberships);
  const currentGymId = useGymMemberStore((s) => s.currentGymId);

  const canManageRoute = React.useMemo(
    () => computeCanManageRoute(user, route, memberships, currentGymId),
    [user, route, memberships, currentGymId]
  );

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

  const rawStatus = (route?.status ?? 'active').toLowerCase();
  const statusKey =
    rawStatus === 'archived' || rawStatus === 'draft' || rawStatus === 'active'
      ? rawStatus
      : 'active';
  const status = React.useMemo(() => {
    const def = STATUS_MAP[statusKey as keyof typeof STATUS_MAP] ?? STATUS_MAP.active;
    return {
      ...def,
      label: t(`routes.statusLabel.${statusKey}`),
    };
  }, [statusKey, t]);

  const styleLabel = route?.style != null ? getRouteStyleLabel(route.style) : null;

  const unknown = t('common.unknown');
  const setterName = route?.setter
    ? `${route.setter.firstName ?? ''} ${route.setter.lastName ?? ''}`.trim() || unknown
    : unknown;

  const flashRate =
    route?.ascentCount && route.flashCount
      ? Math.round((route.flashCount / route.ascentCount) * 100)
      : null;

  const rating = route?.communityRating ? route.communityRating.toFixed(1) : null;

  const locale = i18n.language === 'ua' ? 'uk-UA' : 'en-US';
  const addedDate = route?.createdAt
    ? new Date(route.createdAt).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return {
    route,
    isLoading,
    isError,
    error,
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
