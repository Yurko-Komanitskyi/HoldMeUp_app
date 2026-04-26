import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteDetailsQuery } from '@/entities/route/model/routeHooks';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import type { AnnotationData } from '@/features/route-annotation';
import { getRouteStyleLabel } from '@/entities/route/lib/route-style';
import { computeCanManageRoute } from '@/entities/route/lib/can-manage-route';
import i18n from '@/shared/lib/i18n';
import { normalizeAnnotationData } from '@/features/route-annotation/lib/normalize-annotation';

const STATUS_MAP = {
  active: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  archived: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  draft: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
} as const;

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
    const rawAnnotation = route?.annotation ?? route?.annotationData;
    const normalized = normalizeAnnotationData(rawAnnotation);
    if (__DEV__ && route?.id) {
      console.log('[RouteDetail] annotation parsed', {
        routeId: route.id,
        hasRaw: !!rawAnnotation,
        shapes: normalized?.shapes?.length ?? 0,
      });
    }
    return normalized;
  }, [route?.annotation, route?.annotationData]);

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
