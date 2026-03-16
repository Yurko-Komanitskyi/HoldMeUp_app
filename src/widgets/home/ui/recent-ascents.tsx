import * as React from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { Mountain, Plus, CheckCircle2, XCircle, Timer } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Text } from '@/shared/ui/text';
import { Icon } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';
import { ASCENT_TYPE_META } from '@/entities/ascent/lib/meta';
import { ACCENT } from '@/shared/config/palette';
import type { Ascent } from '@/entities/ascent/model/ascent';

interface RecentAscentRowProps {
  ascent: Ascent;
  cardBg: string;
  borderColor: string;
  isDark: boolean;
}

function RecentAscentRow({ ascent, cardBg, borderColor, isDark }: RecentAscentRowProps) {
  const meta = ASCENT_TYPE_META[ascent.type?.toUpperCase()] ?? ASCENT_TYPE_META.REPEAT;
  const timeLabel =
    ascent.timeSeconds != null
      ? `${Math.floor(ascent.timeSeconds / 60)}:${String(ascent.timeSeconds % 60).padStart(2, '0')}`
      : null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: cardBg,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor,
      }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: ascent.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon
          as={ascent.success ? CheckCircle2 : XCircle}
          size={18}
          color={ascent.success ? '#22c55e' : '#ef4444'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#fff' : '#000' }}
          numberOfLines={1}>
          #{ascent.routeId.slice(-6)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <View style={{ backgroundColor: meta.color + '18', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: meta.color }}>{meta.label}</Text>
          </View>
          {timeLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Timer size={10} color="rgba(128,128,128,0.5)" />
              <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.6)' }}>{timeLabel}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={{ fontSize: 11, color: 'rgba(128,128,128,0.55)' }}>
        {new Date(ascent.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })}
      </Text>
    </View>
  );
}

interface RecentAscentsProps {
  ascents:    Ascent[];
  isLoading:  boolean;
  onAddPress: () => void;
}

export function RecentAscents({ ascents, isLoading, onAddPress }: RecentAscentsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg     = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(128,128,128,0.6)' }}>
          {t('home.recentAscents').toUpperCase()}
        </Text>
        <Pressable onPress={() => router.push('/(tabs)/ascents' as never)}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: ACCENT }}>{t('home.allRoutes')}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ gap: 8 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
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
          <Mountain size={36} color="rgba(128,128,128,0.3)" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(128,128,128,0.55)' }}>
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: ACCENT }}>{t('home.logFirst')}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={{ gap: 8 }}>
          {ascents.map((ascent) => (
            <RecentAscentRow
              key={ascent.id}
              ascent={ascent}
              cardBg={cardBg}
              borderColor={borderColor}
              isDark={isDark}
            />
          ))}
        </View>
      )}
    </View>
  );
}
