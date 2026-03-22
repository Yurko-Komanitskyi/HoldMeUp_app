import * as React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, MapPin, Plus, CheckCircle } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useTranslation } from 'react-i18next';

interface Props {
  gymId: string;
  name: string;
  address?: string | null;
  description?: string | null;
  isDark: boolean;
  joining: boolean;
  joined: boolean;
  error?: string | null;
  onJoin: (gymId: string) => void;
}

export function JoinableGymCard({
  gymId,
  name,
  address,
  description,
  isDark,
  joining,
  joined,
  error,
  onJoin,
}: Props) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: joined ? ACCENT + '50' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        backgroundColor: joined ? ACCENT + '06' : isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        padding: 16,
        gap: 10,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: ACCENT + '15',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Dumbbell size={20} color={ACCENT} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#fff' : '#000' }}>
            {name}
          </Text>
          {address ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                  flex: 1,
                }}
                numberOfLines={1}>
                {address}
              </Text>
            </View>
          ) : null}
          {description ? (
            <Text
              style={{
                fontSize: 11,
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
                marginTop: 2,
              }}
              numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      {error ? <Text style={{ fontSize: 12, color: '#ef4444' }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={() => !joined && onJoin(gymId)}
        disabled={joining || joined}
        style={{
          height: 40,
          borderRadius: 12,
          backgroundColor: joined ? ACCENT + '15' : ACCENT,
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
            <Plus size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{t('gym.joinCta')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

