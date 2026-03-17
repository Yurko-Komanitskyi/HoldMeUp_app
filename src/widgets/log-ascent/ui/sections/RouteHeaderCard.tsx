import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { resolveRouteColor } from '@/shared/config/palette';
import type { Route } from '@/entities/route/model/route';

interface Props {
  route: Route | undefined;
}

export function RouteHeaderCard({ route }: Props) {
  if (!route) return null;

  const routeColor = resolveRouteColor(route.color);
  const isWhite = route.color?.toLowerCase() === 'white';
  const colorText = isWhite ? '#374151' : '#ffffff';

  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: routeColor }}>
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 15, fontWeight: '900', color: colorText }}>{route.grade}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colorText }} numberOfLines={1}>
            {route.name}
          </Text>
          {route.sector?.name && (
            <Text style={{ fontSize: 13, color: colorText, opacity: 0.75, marginTop: 2 }}>
              {route.sector.name}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

