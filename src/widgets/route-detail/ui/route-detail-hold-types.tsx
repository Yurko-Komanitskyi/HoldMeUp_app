import * as React from 'react';
import { View } from 'react-native';
import { Tag } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { HOLD_TYPE_LABELS } from '@/entities/route/lib/constants';

type HoldChipProps = {
  label: string;
};

function HoldChip({ label }: HoldChipProps) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(148,163,184,0.12)',
      }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: 'rgba(15,23,42,0.9)',
        }}>
        {label}
      </Text>
    </View>
  );
}

type Props = {
  holdTypes: Array<string | number>;
};

export function RouteDetailHoldTypes({ holdTypes }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  if (!holdTypes || holdTypes.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Tag size={13} color={sectionTitleColor} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: sectionTitleColor,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
          }}>
          Типи тримок
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {holdTypes.map((hold) => (
          <HoldChip
            key={String(hold)}
            label={HOLD_TYPE_LABELS[hold as string] ?? String(hold)}
          />
        ))}
      </View>
    </View>
  );
}

