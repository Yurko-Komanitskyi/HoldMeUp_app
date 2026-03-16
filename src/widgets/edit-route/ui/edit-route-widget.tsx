import * as React from 'react';
import { View, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { AlertCircle, ChevronLeft } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { useRouteQuery } from '@/entities/route/model/useRouteQuery';
import { updateRoute, routeKeys } from '@/entities/route/api/routeApi';
import { RouteFormWidget, type RouteFormSubmitData } from '@/widgets/route-form/ui/route-form-widget';
import { parseApiError } from '@/shared/lib/api-error';
import type { AnnotationData } from '@/shared/ui/route-annotator';

export function EditRouteWidget() {
  const { id }      = useLocalSearchParams<{ id: string }>();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const insets      = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor   = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const { data: route, isLoading, isError } = useRouteQuery(id ?? '');

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routeKeys.detail(id ?? '') });
      queryClient.invalidateQueries({ queryKey: routeKeys.all });
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={mutedColor} />
      </View>
    );
  }

  if (isError || !route) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
        <AlertCircle size={44} color="#ef4444" />
        <Text className="text-center text-base font-semibold text-foreground">Не вдалося завантажити маршрут</Text>
        <Pressable onPress={() => router.back()} style={{ borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10, borderColor: mutedColor }}>
          <Text style={{ color: textColor, fontSize: 14 }}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  let parsedAnnotation: AnnotationData | null = null;
  if (route.annotationData) {
    if (typeof route.annotationData === 'string') {
      try { parsedAnnotation = JSON.parse(route.annotationData) as AnnotationData; }
      catch { /* ignore */ }
    } else {
      parsedAnnotation = route.annotationData as AnnotationData;
    }
  }

  const initialValues = {
    name:            route.name,
    grade:           route.grade,
    color:           route.color,
    sectorId:        route.sectorId,
    description:     route.description ?? '',
    height:          route.height?.toString() ?? '',
    holdTypes:       (route.holdTypes as string[]) ?? [],
    tags:            route.tags?.join(', ') ?? '',
    status:          (route.status?.toLowerCase() as 'active' | 'draft') ?? 'active',
    photoUrl:        route.photoUrl ?? '',
    photoDisplayUri: route.photoUrl ?? undefined,
    annotationData:  parsedAnnotation,
  };

  async function handleSubmit(data: RouteFormSubmitData) {
    try {
      const height = data.height ? parseFloat(data.height) : null;
      const tags   = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      await mutateAsync({
        id:             id!,
        name:           data.name,
        grade:          data.grade,
        color:          data.color,
        sectorId:       data.sectorId,
        description:    data.description?.trim() || null,
        height:         Number.isNaN(height as number) ? null : height,
        status:         data.status,
        photoUrl:       data.photoUrl?.trim() || null,
        holdTypes:      data.holdTypes,
        tags,
        annotationData: data.annotationData ? JSON.stringify(data.annotationData) : null,
      });
      router.back();
    } catch (error) {
      const { message } = parseApiError(error);
      Alert.alert('Помилка', message);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        backgroundColor: bgColor,
        gap: 12,
      }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 6, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <ChevronLeft size={20} color={textColor} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: textColor }}>
            {isPending ? 'Збереження…' : 'Редагування маршруту'}
          </Text>
          {route.sector?.name && (
            <Text style={{ fontSize: 13, color: mutedColor, marginTop: 1 }}>{route.sector.name}</Text>
          )}
        </View>
      </View>

      <RouteFormWidget
        initialValues={initialValues}
        submitLabel="Зберегти зміни"
        onSubmitForm={handleSubmit}
      />
    </View>
  );
}
