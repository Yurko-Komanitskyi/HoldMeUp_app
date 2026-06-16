// routes-no-gym-state.tsx
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mountain } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export function RoutesNoGymState() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 }}
      className="bg-background">
      <Animated.View
        entering={FadeInDown.delay(0).duration(420).springify().damping(18)}
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Mountain size={34} color={colors.mutedForeground} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(380).springify().damping(18)}
        style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: -0.4,
            color: colors.foreground,
            textAlign: 'center',
          }}>
          {t('routes.noGymTitle')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            maxWidth: 240,
            color: colors.mutedForeground,
          }}>
          {t('routes.noGymBody')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(360).springify().damping(18)}>
        <TouchableOpacity
          onPress={() => router.push('/gym/join' as never)}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 15,
            backgroundColor: ACCENT,
          }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.destructiveForeground, letterSpacing: -0.2 }}>
            {t('routes.findGym')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
