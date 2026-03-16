import * as React from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { resolveRouteColor } from '@/shared/config/palette';
import { STYLE_LABELS } from '@/entities/route/lib/constants';
import type { Route } from '@/entities/route/model/route';

const STATUS_CONFIG = {
  archived: { label: 'Архів',    color: '#9ca3af', bg: 'rgba(107,114,128,0.14)' },
  draft:    { label: 'Чернетка', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)'  },
} as const;

interface RouteCardProps {
  route: Route;
}

export function RouteCard({ route }: RouteCardProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const hex       = resolveRouteColor(route.color);
  const isWhite   = route.color?.toLowerCase() === 'white';
  const gradeText = isWhite ? '#374151' : '#ffffff';

  const styleLabel = route.style
    ? (STYLE_LABELS[route.style.toLowerCase()] ?? route.style)
    : null;

  const setterName =
    route.setter?.firstName || route.setter?.lastName
      ? `${route.setter.firstName ?? ''} ${route.setter.lastName ?? ''}`.trim()
      : null;

  const statusKey = route.status?.toLowerCase() as keyof typeof STATUS_CONFIG;
  const nonActiveStatus = STATUS_CONFIG[statusKey];

  const meta = [route.sector?.name, styleLabel].filter(Boolean).join(' · ');

  const cardBg    = isDark ? '#0f0f14' : '#ffffff';
  const borderCol = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const nameCol   = isDark ? '#ffffff' : '#0a0a0a';
  const metaCol   = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const subtleCol = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)';

  return (
    <Pressable
      onPress={() => router.push(`/route/${route.id}` as never)}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: borderCol,
        backgroundColor: cardBg,
        opacity: pressed ? 0.85 : 1,
      })}>

      {/* Color stripe */}
      <View style={{ width: 4, backgroundColor: hex, opacity: isWhite ? 0.5 : 1 }} />

      {/* Grade badge */}
      <View style={{ paddingLeft: 14, paddingVertical: 14, justifyContent: 'center' }}>
        <View style={{
          width: 46, height: 46, borderRadius: 23,
          backgroundColor: hex,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: isWhite ? 1.5 : 0,
          borderColor: '#d1d5db',
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '900',
            color: gradeText,
            letterSpacing: -0.3,
            textShadowColor: 'rgba(0,0,0,0.25)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            {route.grade}
          </Text>
        </View>
      </View>

      {/* Main content */}
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 13, justifyContent: 'center', gap: 4 }}>

        {/* Name */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: nameCol, letterSpacing: -0.2 }} numberOfLines={1}>
          {route.name}
        </Text>

        {/* Meta: sector · style */}
        {meta ? (
          <Text style={{ fontSize: 12, color: metaCol }} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}

        {/* Bottom row: setter, status badge, ascent count */}
        {(setterName || nonActiveStatus || (route.ascentCount != null && route.ascentCount > 0)) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
            {setterName && (
              <Text style={{ fontSize: 11, color: subtleCol, flexShrink: 1 }} numberOfLines={1}>
                {setterName}
              </Text>
            )}
            {nonActiveStatus && (
              <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: nonActiveStatus.bg }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: nonActiveStatus.color }}>
                  {nonActiveStatus.label}
                </Text>
              </View>
            )}
            {route.ascentCount != null && route.ascentCount > 0 && (
              <Text style={{ fontSize: 11, color: subtleCol }}>
                ↑ {route.ascentCount}
              </Text>
            )}
          </View>
        ) : null}
      </View>

      {/* Chevron */}
      <View style={{ paddingRight: 14, justifyContent: 'center' }}>
        <ChevronRight size={15} color={subtleCol} />
      </View>
    </Pressable>
  );
}
