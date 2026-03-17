import * as React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/shared/ui/skeleton';

export function RouteSkeletonCard() {
  return (
    <View
      style={{
        height: 80,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 16,
        borderWidth: 1,
      }}
      className="border-border bg-card">
      <Skeleton style={{ width: 6, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
        }}>
        <Skeleton style={{ width: 44, height: 44, borderRadius: 12 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton style={{ height: 14, width: '65%', borderRadius: 6 }} />
          <Skeleton style={{ height: 11, width: '35%', borderRadius: 6 }} />
        </View>
      </View>
    </View>
  );
}
