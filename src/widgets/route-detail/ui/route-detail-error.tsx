import * as React from 'react';
import { View } from 'react-native';

import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

type Props = {
  error: unknown;
  onRetry: () => void;
};

export function RouteDetailError({ error, onRetry }: Props) {
  return (
    <View style={{ flex: 1 }} className="bg-background">
      <QueryErrorPanel error={error ?? new Error('')} onRetry={onRetry} />
    </View>
  );
}
