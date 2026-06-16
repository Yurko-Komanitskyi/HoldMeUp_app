import * as React from 'react';
import { View, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { resolveRouteColor, ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import type { Route } from '@/entities/route/model/route';
import { FeaturedRouteCard } from '@/entities/route/ui/featured-route-card';

interface FeaturedRoutesProps {
  routes: Route[];
  isLoading: boolean;
}

export function FeaturedRoutes({ routes, isLoading }: FeaturedRoutesProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();

  if (!isLoading && routes.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(380).springify().damping(18)}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          marginBottom: 12,
        }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.8,
            color: colors.mutedForeground,
          }}>
          {t('home.featuredRoutes').toUpperCase()}
        </Text>
        <Pressable onPress={() => router.push('/(tabs)/routes' as never)}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: ACCENT }}>
            {t('home.allRoutes')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {isLoading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-40 rounded-2xl" />)
          : routes.map((route, index) => (
              <Animated.View
                key={route.id}
                entering={FadeInDown.delay(index * 60).duration(360).springify().damping(18)}>
                <FeaturedRouteCard
                  route={route}
                  onPress={() => router.push(`/route/${route.id}` as never)}
                />
              </Animated.View>
            ))}
        {!isLoading && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/routes' as never)}
            style={{
              width: 140,
              height: 130,
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            activeOpacity={0.7}>
            <Plus size={22} color={colors.mutedForeground} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontWeight: '600' }}>
              {t('home.allRoutes')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Animated.View>
  );
}
