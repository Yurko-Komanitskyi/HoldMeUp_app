import * as React from 'react';

import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export function SectionLabel({ children }: { children: string }) {
  const colors = useThemeColor();

  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: colors.mutedForeground,
        marginBottom: 12,
      }}>
      {children}
    </Text>
  );
}
