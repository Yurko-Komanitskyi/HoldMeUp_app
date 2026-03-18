import * as React from 'react';
import { View } from 'react-native';
import { Calendar, Mountain, Ruler, TrendingUp, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';

type InfoRowProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  iconColor: string;
};

function InfoRow({ icon: Icon, label, value, iconColor }: InfoRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color={iconColor} />
        <Text style={{ fontSize: 13, color: 'rgba(148,163,184,1)' }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(15,23,42,0.92)' }}>
        {value}
      </Text>
    </View>
  );
}

type Props = {
  sectorName?: string | null;
  styleLabel?: string | null;
  height?: number | null;
  setterName: string;
  addedDate?: string | null;
};

export function RouteDetailInfoCard({
  sectorName,
  styleLabel,
  height,
  setterName,
  addedDate,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        overflow: 'hidden',
      }}>
      <View style={{ paddingHorizontal: 16 }}>
        {sectorName && (
          <>
            <InfoRow
              icon={Mountain}
              label="Сектор"
              value={sectorName}
              iconColor="#7badcf"
            />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        )}
        {styleLabel && (
          <>
            <InfoRow icon={TrendingUp} label="Стиль" value={styleLabel} iconColor="#a78bfa" />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        )}
        {height ? (
          <>
            <InfoRow
              icon={Ruler}
              label="Висота"
              value={`${height} м`}
              iconColor="#f59e0b"
            />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        ) : null}
        <InfoRow icon={User} label="Setter" value={setterName} iconColor="#7badcf" />
        {addedDate && (
          <>
            <View style={{ height: 1, backgroundColor: dividerColor }} />
            <InfoRow
              icon={Calendar}
              label="Додано"
              value={addedDate}
              iconColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
            />
          </>
        )}
      </View>
    </View>
  );
}

