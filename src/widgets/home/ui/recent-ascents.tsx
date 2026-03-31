import * as React from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { Mountain, Plus, CheckCircle2, XCircle, Timer } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { Skeleton } from '@/shared/ui/skeleton';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import type { Ascent } from '@/entities/ascent/model/ascent';
import { AscentCard } from '@/entities/ascent/ui/ascent-card';

interface RecentAscentsProps {
  ascents: Ascent[];
  isLoading: boolean;
  onAddPress: () => void;
}

export function RecentAscents({ ascents, isLoading, onAddPress }: RecentAscentsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();

  const cardBg = colors.card;
  const borderColor = colors.border;

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.8,
            color: colors.mutedForeground,
          }}>
          {t('home.recentAscents').toUpperCase()}
        </Text>
        <Pressable onPress={() => router.push('/ascents/ascents' as never)}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: ACCENT }}>{t('home.allAscents')}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </View>
      ) : ascents.length === 0 ? (
        <TouchableOpacity
          onPress={onAddPress}
          style={{
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor,
          }}
          activeOpacity={0.8}>
          <Mountain size={36} color={colors.mutedForeground} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.mutedForeground }}>
            {t('home.noAscents')}
          </Text>
          <View
            style={{
              backgroundColor: ACCENT + '18',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
            <Plus size={14} color={ACCENT} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>
              {t('home.logFirst')}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={{ gap: 8 }}>
          {ascents.map((ascent) => (
            <AscentCard key={ascent.id} ascent={ascent} variant="compact" />
          ))}
        </View>
      )}
    </View>
  );
}
