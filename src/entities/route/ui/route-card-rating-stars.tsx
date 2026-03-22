import * as React from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';

export function RouteCardRatingStars({ rating }: { rating: number }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <View className="flex-row items-center gap-px">
      {Array.from({ length: 5 }, (_, i) => {
        const active = i < full;
        return (
          <Star
            key={i}
            size={11}
            color={active ? '#fbbf24' : 'rgba(148,163,184,0.45)'}
            fill={active ? '#fbbf24' : 'transparent'}
            strokeWidth={active ? 0 : 1.5}
          />
        );
      })}
    </View>
  );
}
