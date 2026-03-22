import * as React from 'react';
import { View } from 'react-native';
import { Calendar, Mountain, Ruler, TrendingUp, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';

type InfoRowProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  iconColor: string;
  isDark: boolean;
};

function InfoRow({ icon: Icon, label, value, iconColor, isDark }: InfoRowProps) {
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
        <Text
          style={{
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          }}>
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.88)',
          maxWidth: '55%',
          textAlign: 'right',
        }}
        numberOfLines={1}>
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
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
        overflow: 'hidden',
      }}>
      <View style={{ paddingHorizontal: 16 }}>
        {sectorName && (
          <>
            <InfoRow
              icon={Mountain}
              label={t('routeDetail.sector')}
              value={sectorName}
              iconColor="#7badcf"
              isDark={isDark}
            />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        )}
        {styleLabel && (
          <>
            <InfoRow
              icon={TrendingUp}
              label={t('routeDetail.style')}
              value={styleLabel}
              iconColor="#a78bfa"
              isDark={isDark}
            />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        )}
        {height ? (
          <>
            <InfoRow
              icon={Ruler}
              label={t('routeDetail.height')}
              value={t('routeDetail.heightValue', { value: height })}
              iconColor="#f59e0b"
              isDark={isDark}
            />
            <View style={{ height: 1, backgroundColor: dividerColor }} />
          </>
        ) : null}
        <InfoRow
          icon={User}
          label={t('routeDetail.setter')}
          value={setterName}
          iconColor="#7badcf"
          isDark={isDark}
        />
        {addedDate && (
          <>
            <View style={{ height: 1, backgroundColor: dividerColor }} />
            <InfoRow
              icon={Calendar}
              label={t('routeDetail.added')}
              value={addedDate}
              iconColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              isDark={isDark}
            />
          </>
        )}
      </View>
    </View>
  );
}
