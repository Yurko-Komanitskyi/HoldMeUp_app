import * as React from 'react';
import { View } from 'react-native';

import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

interface AscentDetailErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function AscentDetailError({ error, onRetry }: AscentDetailErrorProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-4">
      <QueryErrorPanel error={error ?? new Error('')} onRetry={onRetry} />
    </View>
  );
}
