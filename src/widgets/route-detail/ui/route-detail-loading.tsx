import * as React from 'react';
import { View } from 'react-native';

import { Skeleton } from '@/shared/ui/skeleton';

export function RouteDetailLoading() {
  return (
    <View style={{ flex: 1 }} className="bg-background">
      <Skeleton style={{ height: 260, width: '100%' }} />
      <View style={{ gap: 16, paddingHorizontal: 16, paddingTop: 20 }}>
        <Skeleton style={{ height: 9, width: '40%', borderRadius: 8 }} />
        <Skeleton style={{ height: 32, width: '70%', borderRadius: 10 }} />
        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 4 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 72, flex: 1, borderRadius: 18 }} />
          ))}
        </View>
        <Skeleton style={{ marginTop: 8, height: 120, borderRadius: 18 }} />
      </View>
    </View>
  );
}

