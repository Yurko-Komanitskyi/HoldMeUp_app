import * as React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/shared/ui/skeleton';

export function RouteSkeletonCard() {
  return (
    <View
      style={{
        minHeight: 124,
        overflow: 'hidden',
        borderRadius: 16,
        borderWidth: 1,
      }}
      className="border-border bg-card">
      <View
        style={{
          height: 6,
          width: '100%',
        }}>
        <Skeleton style={{ width: '100%', height: '100%' }} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 10,
        }}>
        <Skeleton style={{ width: 64, height: 64, borderRadius: 16 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton style={{ height: 16, width: '68%', borderRadius: 6 }} />
          <Skeleton style={{ height: 11, width: '42%', borderRadius: 6 }} />
          <Skeleton style={{ height: 11, width: '56%', borderRadius: 6 }} />
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Skeleton style={{ width: 52, height: 24, borderRadius: 999 }} />
          <Skeleton style={{ width: 26, height: 10, borderRadius: 6 }} />
          <Skeleton style={{ width: 22, height: 10, borderRadius: 6 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 10 }}>
        <Skeleton style={{ width: 54, height: 18, borderRadius: 6 }} />
        <Skeleton style={{ width: 66, height: 18, borderRadius: 6 }} />
        <Skeleton style={{ width: 34, height: 18, borderRadius: 6 }} />
      </View>
    </View>
  );
}
