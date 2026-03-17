import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/ui/text';
import { resolveRouteColor } from '@/shared/config/palette';
import type { Route } from '@/entities/route/model/route';

export interface FeaturedRouteCardProps {
  route: Route;
  onPress: () => void;
}

export function FeaturedRouteCard({ route, onPress }: FeaturedRouteCardProps) {
  const hex = resolveRouteColor(route.color);
  const isWhite = route.color?.toLowerCase() === 'white';
  const textCol = isWhite ? '#374151' : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 140,
        height: 130,
        borderRadius: 20,
        backgroundColor: hex,
        padding: 14,
        justifyContent: 'space-between',
        borderWidth: isWhite ? 1 : 0,
        borderColor: '#e5e7eb',
      }}
      activeOpacity={0.85}>
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: 'flex-start',
        }}>
        <Text style={{ fontSize: 14, fontWeight: '900', color: textCol }}>{route.grade}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: textCol }} numberOfLines={2}>
          {route.name}
        </Text>
        <Text style={{ fontSize: 11, color: textCol, opacity: 0.7, marginTop: 2 }}>
          {route.sector?.name ?? ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
