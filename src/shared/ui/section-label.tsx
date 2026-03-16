import * as React from 'react';
import { Text } from '@/shared/ui/text';

export function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: 'rgba(128,128,128,0.7)',
        marginBottom: 12,
      }}>
      {children}
    </Text>
  );
}
