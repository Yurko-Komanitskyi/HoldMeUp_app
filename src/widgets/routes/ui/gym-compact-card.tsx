import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, MapPin, CheckCircle, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import type { Gym } from '@/entities/gym/model/gym';
import { useTranslation } from 'react-i18next';

interface Props {
  gym: Gym;
  onJoin: (id: string) => void;
  joining: boolean;
  joined: boolean;
}

export function GymCompactCard({ gym, onJoin, joining, joined }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        width: 260,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: joined ? ACCENT + '50' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        backgroundColor: joined ? ACCENT + '06' : isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        padding: 14,
        gap: 10,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: ACCENT + '18',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Dumbbell size={20} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {gym.name}
          </Text>
          {gym.address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                  flex: 1,
                }}
                numberOfLines={1}>
                {gym.address}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => !joined && onJoin(gym.id)}
        disabled={joining || joined}
        style={{
          height: 38,
          borderRadius: 12,
          backgroundColor: joined ? ACCENT + '12' : ACCENT,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: joining ? 0.7 : 1,
        }}>
        {joining ? (
          <ActivityIndicator size="small" color={joined ? ACCENT : '#fff'} />
        ) : joined ? (
          <>
            <CheckCircle size={14} color={ACCENT} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>{t('gym.joinedCta')}</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{t('gym.joinCta')}</Text>
            <ChevronRight size={14} color="rgba(255,255,255,0.9)" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

