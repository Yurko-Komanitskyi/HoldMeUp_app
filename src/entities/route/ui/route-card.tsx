import * as React from 'react';
import { View, Text, Pressable, type ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Mountain, TrendingUp, Zap } from 'lucide-react-native';

import { cn } from '@/shared/lib/utils';
import type { Route } from '@/entities/route/model/route';
import { useRouter } from 'expo-router';
import { Icon } from '@/shared/ui/icon';

import { formatRouteSetterName } from '@/entities/route/lib/format-route-setter';
import { gradeColorForRouteGrade } from '@/entities/route/lib/route-grade';
import {
  routeAccentGradientStops,
  routeCardGlyphColor,
} from '@/entities/route/lib/route-accent-visual';
import {
  getRouteStyleIcon,
  getRouteStyleLabel,
  normalizeRouteStyleKey,
} from '@/entities/route/lib/route-style';
import { RouteCardRatingStars } from '@/entities/route/ui/route-card-rating-stars';
import { useTranslation } from 'react-i18next';

function MetaSeparator() {
  return <View className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/35" />;
}

interface RouteCardProps {
  route: Route;
  className?: string;
}

export function RouteCard({ route, className }: RouteCardProps) {
  const { t } = useTranslation();
  const styleLabel = getRouteStyleLabel(route.style);
  const styleKey = route.style?.trim() ? normalizeRouteStyleKey(route.style) : null;
  const StyleGlyph = styleKey ? getRouteStyleIcon(styleKey) : Mountain;

  const holdsToShow = route.holdTypes?.slice(0, 3) ?? [];
  const hasMoreHolds = (route.holdTypes?.length ?? 0) > 3;
  const router = useRouter();

  const accentStops = routeAccentGradientStops(route.color) as readonly [
    ColorValue,
    ColorValue,
    ...ColorValue[],
  ];
  const glyphColor = routeCardGlyphColor(route.color);
  const gradeTint = gradeColorForRouteGrade(route.grade);

  const handlePress = React.useCallback(() => {
    router.push(`/route/${route.id}`);
  }, [router, route.id]);

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card active:scale-[0.98]',
        className
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient
        colors={accentStops}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 6, width: '100%' }}
      />

      <View className="flex-row gap-3 p-4">
        <LinearGradient
          colors={accentStops}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon as={StyleGlyph} size={28} color={glyphColor} />
        </LinearGradient>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start gap-2">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
                {route.name}
              </Text>

              <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                {route.sector && (
                  <View className="max-w-[100%] flex-row items-center gap-1">
                    <Icon as={MapPin} size={12} className="shrink-0 text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {route.sector.name}
                    </Text>
                  </View>
                )}
                {styleLabel && (
                  <>
                    {route.sector ? <MetaSeparator /> : null}
                    <Text className="text-xs text-muted-foreground">{styleLabel}</Text>
                  </>
                )}
                {route.height != null && (
                  <>
                    {(route.sector || styleLabel) && <MetaSeparator />}
                    <Text className="text-xs text-muted-foreground">{route.height}m</Text>
                  </>
                )}
              </View>

              {route.setter && (
                <Text className="text-xs text-muted-foreground">
                  {t('routeCard.setBy', { name: formatRouteSetterName(route.setter) })}
                </Text>
              )}

              {route.communityRating != null && (
                <View className="pt-0.5">
                  <RouteCardRatingStars rating={route.communityRating} />
                </View>
              )}
            </View>

            <View className="shrink-0 items-end gap-1.5">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${gradeTint}26` }}>
                <Text className="text-sm font-bold" style={{ color: gradeTint }}>
                  {route.grade}
                </Text>
              </View>
              {route.ascentCount != null && (
                <View className="flex-row items-center gap-1">
                  <Icon as={TrendingUp} size={13} className="shrink-0 text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{route.ascentCount}</Text>
                </View>
              )}
              {route.flashCount != null && (
                <View className="flex-row items-center gap-1">
                  <Icon as={Zap} size={13} className="shrink-0 text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{route.flashCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {holdsToShow.length > 0 && (
        <View
          className="flex-row flex-wrap gap-1.5 px-4 pt-0.5"
          style={{ paddingBottom: 10 }}>
          {holdsToShow.map((hold) => (
            <View key={hold} className="rounded-md bg-muted px-2 py-0.5">
              <Text className="text-xs capitalize text-muted-foreground">{hold}</Text>
            </View>
          ))}
          {hasMoreHolds && (
            <View className="rounded-md bg-muted px-2 py-0.5">
              <Text className="text-xs text-muted-foreground">
                +{(route.holdTypes?.length ?? 0) - 3}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
