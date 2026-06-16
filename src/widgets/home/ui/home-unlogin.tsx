import * as React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mountain, TrendingUp, MapPin, Zap, ChevronRight, Star } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

export function HomeUnlogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();

  const FEATURES = React.useMemo(
    () => [
      {
        icon: Mountain,
        color: ACCENT,
        bgColor: ACCENT + '18',
        title: t('homeUnlogin.f1Title'),
        desc: t('homeUnlogin.f1Desc'),
      },
      {
        icon: TrendingUp,
        color: colors.chart2,
        bgColor: colors.chart2 + '18',
        title: t('homeUnlogin.f2Title'),
        desc: t('homeUnlogin.f2Desc'),
      },
      {
        icon: MapPin,
        color: colors.chart4,
        bgColor: colors.chart4 + '18',
        title: t('homeUnlogin.f3Title'),
        desc: t('homeUnlogin.f3Desc'),
      },
      {
        icon: Star,
        color: colors.chart3,
        bgColor: colors.chart3 + '18',
        title: t('homeUnlogin.f4Title'),
        desc: t('homeUnlogin.f4Desc'),
      },
    ],
    [t, colors.chart2, colors.chart4, colors.chart3]
  );

  const bg = colors.background;
  const cardBg = colors.card;
  const cardBorder = colors.border;
  const headingColor = colors.foreground;
  const mutedColor = colors.mutedForeground;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 40,
        }}>
        {/* ── Hero ── */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          {/* Icon */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(420).springify().damping(18)}
            style={{
              width: 92,
              height: 92,
              borderRadius: 30,
              backgroundColor: ACCENT + '18',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: ACCENT + '28',
              marginBottom: 20,
              shadowColor: ACCENT,
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
            }}>
            <Mountain size={46} color={ACCENT} />
          </Animated.View>

          {/* Badge */}
          <Animated.View
            entering={FadeInDown.delay(80).duration(380).springify().damping(18)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: colors.secondary,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              marginBottom: 14,
            }}>
            <Zap size={12} color={ACCENT} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT }}>
              {t('homeUnlogin.badge')}
            </Text>
          </Animated.View>

          {/* Headline */}
          <Animated.View entering={FadeInDown.delay(160).duration(380).springify().damping(18)}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '900',
                color: headingColor,
                textAlign: 'center',
                letterSpacing: -0.8,
                lineHeight: 38,
                marginBottom: 12,
              }}>
              {t('homeUnlogin.headline1')}
              {'\n'}
              <Text
                style={{
                  color: ACCENT,
                  fontSize: 32,
                  fontWeight: '900',
                  textAlign: 'center',
                  letterSpacing: -0.8,
                  lineHeight: 38,
                  marginBottom: 12,
                }}>
                {t('homeUnlogin.headlineAccent')}
              </Text>{' '}
              {t('homeUnlogin.headline2')}
            </Text>

            {/* Sub */}
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22,
                textAlign: 'center',
                color: mutedColor,
                maxWidth: 280,
              }}>
              {t('homeUnlogin.sub')}
            </Text>
          </Animated.View>
        </View>

        {/* ── Features ── */}
        <View style={{ gap: 10, marginBottom: 32 }}>
          {FEATURES.map((f, index) => (
            <Animated.View
              key={f.title}
              entering={FadeInDown.delay(240 + index * 60).duration(380).springify().damping(18)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: cardBg,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: cardBorder,
              }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: f.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                <f.icon size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: headingColor,
                    marginBottom: 2,
                  }}>
                  {f.title}
                </Text>
                <Text style={{ fontSize: 12, color: mutedColor, lineHeight: 17 }}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
