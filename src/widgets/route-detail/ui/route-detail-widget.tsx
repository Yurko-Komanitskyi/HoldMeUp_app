import * as React from 'react';
import { View, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { resolveRouteColor } from '@/shared/config/palette';
import { useRouteMutations } from '@/entities/route/model/routeHooks';
import { useRouteDetail } from '@/widgets/route-detail/model/useRouteDetail';

import { RouteDetailLoading } from './route-detail-loading';
import { RouteDetailError } from './route-detail-error';
import { RouteDetailHeader } from './route-detail-header';
import { RouteDetailStats } from './route-detail-stats';
import { RouteDetailInfoCard } from './route-detail-info-card';
import { RouteDetailHoldTypes } from './route-detail-hold-types';
import { RouteDetailPhoto } from './route-detail-photo';
import { RouteDetailTags } from './route-detail-tags';
import { RouteDetailDescription } from './route-detail-description';
import { RouteDetailTip } from './route-detail-tip';
import { RouteDetailCta } from './route-detail-cta';
import { useTranslation } from 'react-i18next';

export function RouteDetailWidget() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const { deleteRouteMutation } = useRouteMutations();

  const {
    route,
    isLoading,
    isError,
    error: routeQueryError,
    refetch,
    canManageRoute,
    status,
    styleLabel,
    setterName,
    flashRate,
    rating,
    addedDate,
    parsedAnnotation,
  } = useRouteDetail(id ?? '');

  const confirmDeleteRoute = React.useCallback(() => {
    if (!route) return;
    Alert.alert(
      t('routeDetail.deleteTitle'),
      t('routeDetail.deleteMessage', { name: route.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('routeDetail.delete'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteRouteMutation.mutateAsync(route.id);
                router.back();
              } catch (e) {
                const message = e instanceof Error ? e.message : t('routeDetail.deleteFailed');
                Alert.alert(t('common.errorTitle'), message);
              }
            })();
          },
        },
      ]
    );
  }, [route, deleteRouteMutation, router, t]);

  if (isLoading) return <RouteDetailLoading />;
  if (isError || !route)
    return <RouteDetailError error={routeQueryError} onRetry={() => void refetch()} />;

  const routeColor = resolveRouteColor(route.color);
  const isWhiteRoute = route.color?.toLowerCase() === 'white';
  const heroText = isWhiteRoute ? '#1a1a2a' : '#ffffff';

  const ctaBg = routeColor;
  const ctaText = heroText;

  return (
    <View style={{ flex: 1 }} className="bg-background">
      <RouteDetailHeader
        routeId={route.id}
        routeName={route.name}
        grade={route.grade}
        sectorName={route.sector?.name}
        styleLabel={styleLabel}
        canManageRoute={canManageRoute}
        status={canManageRoute ? status : null}
        routeColor={routeColor}
        heroTextColor={heroText}
        onDeletePress={canManageRoute ? confirmDeleteRoute : undefined}
        isDeleting={deleteRouteMutation.isPending}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <RouteDetailStats
          ascentCount={route.ascentCount ?? 0}
          flashRate={flashRate}
          flashCount={route.flashCount ?? 0}
          rating={rating}
          isDark={isDark}
        />

        <RouteDetailInfoCard
          sectorName={route.sector?.name}
          styleLabel={styleLabel}
          height={route.height}
          setterName={setterName}
          addedDate={addedDate}
        />

        <RouteDetailHoldTypes holdTypes={route.holdTypes ?? []} />

        <RouteDetailPhoto
          photoUrl={route.photoUrl}
          parsedAnnotation={parsedAnnotation}
          displayWidth={screenWidth - 32}
        />

        <RouteDetailTags tags={route.tags ?? []} />

        {route.description && <RouteDetailDescription description={route.description} />}

        <RouteDetailTip />
      </ScrollView>

      <RouteDetailCta routeId={route.id} backgroundColor={ctaBg} textColor={ctaText} />
    </View>
  );
}
