import * as React from 'react';
import { View, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { resolveRouteColor, ACCENT } from '@/shared/config/palette';
import type { Route } from '@/entities/route/model/route';
import { FeaturedRouteCard } from '@/entities/route/ui/featured-route-card';

interface FeaturedRoutesProps {
  routes: Route[];
  isLoading: boolean;
}

export function FeaturedRoutes({ routes, isLoading }: FeaturedRoutesProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!isLoading && routes.length === 0) return null;

  return (
    <View>
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
            color: 'rgba(128,128,128,0.6)',
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
          : routes.map((route) => (
              <FeaturedRouteCard
                key={route.id}
                route={route}
                onPress={() => router.push(`/route/${route.id}` as never)}
              />
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
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            activeOpacity={0.7}>
            <Plus size={22} color="rgba(128,128,128,0.5)" />
            <Text style={{ fontSize: 12, color: 'rgba(128,128,128,0.5)', fontWeight: '600' }}>
              {t('home.allRoutes')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
