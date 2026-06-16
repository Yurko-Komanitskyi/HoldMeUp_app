import * as React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { resolveRouteColor } from '@/shared/config/palette';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';
import { useRouteMutations } from '@/entities/route/model/routeHooks';
import { useRouteDetail } from '@/widgets/route-detail/model/useRouteDetail';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToastStore } from '@/shared/ui/app-toast';

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
import { RouteDetailScoreCard } from './route-detail-score-card';
import { useTranslation } from 'react-i18next';

export function RouteDetailWidget() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const { deleteRouteMutation } = useRouteMutations();
  const toast = useToastStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const scrollRef = useScrollToTopOnFocus<ScrollView>();

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

  async function handleDeleteConfirm() {
    if (!route) return;
    try {
      await deleteRouteMutation.mutateAsync(route.id);
      setShowDeleteConfirm(false);
      router.back();
    } catch (e) {
      setShowDeleteConfirm(false);
      const message = e instanceof Error ? e.message : t('routeDetail.deleteFailed');
      toast.show('error', message);
    }
  }

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
      <ConfirmDialog
        visible={showDeleteConfirm}
        title={t('routeDetail.deleteTitle')}
        message={t('routeDetail.deleteMessage', { name: route.name })}
        confirmLabel={t('routeDetail.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteRouteMutation.isPending}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <RouteDetailHeader
        routeId={route.id}
        routeName={route.name}
        grade={route.grade}
        sectorName={route.sector?.name}
        styleLabel={styleLabel}
        canManageRoute={canManageRoute}
        status={canManageRoute ? status : null}
        routeColor={routeColor}
        routeColorKey={route.color}
        heroTextColor={heroText}
        onDeletePress={canManageRoute ? () => setShowDeleteConfirm(true) : undefined}
        isDeleting={deleteRouteMutation.isPending}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View entering={FadeInDown.delay(0).duration(380).springify().damping(18)}>
          <RouteDetailStats
            ascentCount={route.ascentCount ?? 0}
            flashRate={flashRate}
            flashCount={route.flashCount ?? 0}
            rating={rating}
            isDark={isDark}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(380).springify().damping(18)}>
          <RouteDetailScoreCard grade={route.grade} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(130).duration(380).springify().damping(18)}>
          <RouteDetailInfoCard
            sectorName={route.sector?.name}
            styleLabel={styleLabel}
            height={route.height}
            setterName={setterName}
            addedDate={addedDate}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(190).duration(380).springify().damping(18)}>
          <RouteDetailHoldTypes holdTypes={route.holdTypes ?? []} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(380).springify().damping(18)}>
          <RouteDetailPhoto
            photoUrl={route.photoUrl}
            parsedAnnotation={parsedAnnotation}
            displayWidth={screenWidth - 32}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(290).duration(380).springify().damping(18)}>
          <RouteDetailTags tags={route.tags ?? []} />
          {route.description && <RouteDetailDescription description={route.description} />}
          <RouteDetailTip />
        </Animated.View>
      </ScrollView>

      <RouteDetailCta routeId={route.id} backgroundColor={ctaBg} textColor={ctaText} />
    </View>
  );
}
