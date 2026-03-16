import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, MapPin, CheckCircle, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import type { Gym } from '@/entities/gym/model/gym';

export interface GymCardProps {
  gym: Gym;
  onJoin: (id: string) => void;
  joining: boolean;
  joined: boolean;
  error?: string | null;
}

export function GymCard({ gym, onJoin, joining, joined, error }: GymCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const borderCol = joined ? ACCENT + '60' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: borderCol,
        backgroundColor: joined ? ACCENT + '06' : cardBg,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: ACCENT + '18',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Dumbbell size={22} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {gym.name}
          </Text>
          {gym.address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                  flex: 1,
                }}>
                {gym.address}
              </Text>
            </View>
          ) : null}
          {gym.description ? (
            <Text
              style={{
                fontSize: 12,
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
                marginTop: 2,
              }}
              numberOfLines={2}>
              {gym.description}
            </Text>
          ) : null}
        </View>
      </View>

      {error ? (
        <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={() => !joined && onJoin(gym.id)}
        disabled={joining || joined}
        style={{
          height: 44,
          borderRadius: 14,
          backgroundColor: joined ? ACCENT + '15' : ACCENT,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: joining ? 0.7 : 1,
        }}>
        {joining ? (
          <ActivityIndicator size="small" color={joined ? ACCENT : '#fff'} />
        ) : joined ? (
          <>
            <CheckCircle size={16} color={ACCENT} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: ACCENT }}>Приєднались!</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Приєднатись</Text>
            <ChevronRight size={15} color="rgba(255,255,255,0.8)" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
