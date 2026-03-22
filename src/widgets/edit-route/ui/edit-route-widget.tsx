import * as React from 'react';
import { View, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ChevronLeft } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { useRouteDetailsQuery, useRouteMutations } from '@/entities/route/model/routeHooks';
import { RouteFormWidget } from '@/widgets/route-form/ui/route-form-widget';
import type { RouteFormSubmitData } from '@/widgets/edit-route/ui/useRouteForm';
import { parseApiError } from '@/shared/lib/api-error';
import type { AnnotationData } from '@/features/route-annotation';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function EditRouteWidget() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const colors = useThemeColor();

  const bgColor = colors.background;
  const textColor = colors.foreground;
  const mutedColor = colors.mutedForeground;

  const { data: route, isLoading, isError, error: routeQueryError, refetch: refetchRoute } =
    useRouteDetailsQuery(id ?? '');
  const { updateRouteMutation } = useRouteMutations();
  const { mutateAsync, isPending } = updateRouteMutation;

  if (!id) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <Text className="text-center text-muted-foreground">{t('routeForm.loadError')}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={mutedColor} />
      </View>
    );
  }

  if (isError || !route) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
          }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: colors.secondary,
            }}>
            <ChevronLeft size={20} color={textColor} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>
            {t('routeForm.editTitle')}
          </Text>
        </View>
        <QueryErrorPanel
          error={routeQueryError ?? new Error('')}
          onRetry={() => void refetchRoute()}
        />
        <Pressable
          onPress={() => router.back()}
          style={{
            alignSelf: 'center',
            marginTop: 8,
            borderRadius: 14,
            borderWidth: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderColor: mutedColor,
          }}>
          <Text style={{ color: textColor, fontSize: 14 }}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  let parsedAnnotation: AnnotationData | null = null;
  if (route?.annotationData) {
    if (typeof route.annotationData === 'string') {
      try {
        parsedAnnotation = JSON.parse(route.annotationData) as AnnotationData;
      } catch {
        /* ignore */
      }
    } else {
      parsedAnnotation = route.annotationData as AnnotationData;
    }
  }

  const initialValues = {
    name: route.name,
    grade: route.grade,
    color: route.color,
    style:
      (route.style?.toLowerCase() as 'boulder' | 'lead' | 'top_rope' | 'speed' | undefined) ??
      undefined,
    description: route.description ?? '',
    height: route.height?.toString() ?? '',
    holdTypes: (route.holdTypes as string[]) ?? [],
    tags: route.tags?.join(', ') ?? '',
    status: (route.status?.toLowerCase() as 'active' | 'draft') ?? 'active',
    photoUrl: route.photoUrl ?? '',
    photoDisplayUri: route.photoUrl ?? undefined,
    annotationData: parsedAnnotation,
  };

  async function handleSubmit(data: RouteFormSubmitData) {
    try {
      const height = data.height ? parseFloat(data.height) : null;
      const tags = data.tags
        ? data.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];
      await mutateAsync({
        id: id!,
        name: data.name,
        grade: data.grade,
        color: data.color,
        sectorId: data.sectorId,
        style: data.style ?? null,
        description: data.description?.trim() || null,
        height: Number.isNaN(height as number) ? null : height,
        status: data.status,
        photoUrl: data.photoUrl?.trim() || null,
        holdTypes: data.holdTypes,
        tags,
        annotationData: data.annotationData ? JSON.stringify(data.annotationData) : null,
      });
      router.back();
    } catch (error) {
      const { message } = parseApiError(error);
      Alert.alert(t('common.errorTitle'), message);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: bgColor,
          gap: 12,
        }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            padding: 6,
            borderRadius: 12,
            backgroundColor: colors.secondary,
          }}>
          <ChevronLeft size={20} color={textColor} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>
            {isPending ? t('routeForm.saving') : t('routeForm.editTitle')}
          </Text>
          {route.sector?.name && (
            <Text style={{ fontSize: 13, color: mutedColor, marginTop: 1 }}>
              {route.sector.name}
            </Text>
          )}
        </View>
      </View>

      <View style={{ flex: 1, paddingTop: 8 }}>
        <RouteFormWidget
          initialValues={initialValues}
          submitLabel={t('routeForm.saveChanges')}
          onSubmitForm={handleSubmit}
        />
      </View>
    </View>
  );
}
