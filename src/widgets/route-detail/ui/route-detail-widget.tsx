import * as React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

import { resolveRouteColor } from '@/shared/config/palette';
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

export function RouteDetailWidget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  const {
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
  } = useRouteDetail(id ?? '');

  if (isLoading) return <RouteDetailLoading />;
  if (isError || !route) return <RouteDetailError onRetry={refetch} />;

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
        status={status}
        routeColor={routeColor}
        heroTextColor={heroText}
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
