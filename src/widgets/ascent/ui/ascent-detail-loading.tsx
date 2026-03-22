import * as React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/shared/ui/skeleton';

export function AscentDetailLoading() {
  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <Skeleton className="mb-4 h-10 w-full rounded-xl" />
      <Skeleton className="mb-4 h-36 w-full rounded-2xl" />
      <View className="mb-4 flex-row gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 flex-1 rounded-2xl" />
        ))}
      </View>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </View>
  );
}
