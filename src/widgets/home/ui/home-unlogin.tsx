import * as React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
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
          <View
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
          </View>

          {/* Badge */}
          <View
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
          </View>

          {/* Headline */}
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
            <Text style={{ color: ACCENT }}>{t('homeUnlogin.headlineAccent')}</Text>
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
        </View>

        {/* ── Features ── */}
        <View style={{ gap: 10, marginBottom: 32 }}>
          {FEATURES.map((f) => (
            <View
              key={f.title}
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
                <Text style={{ fontSize: 12, color: mutedColor, lineHeight: 17 }}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTA Buttons ── */}
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => router.push('/auth/register' as never)}
            style={({ pressed }) => ({
              backgroundColor: ACCENT,
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed ? 0.88 : 1,
              shadowColor: ACCENT,
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            })}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: colors.destructiveForeground,
                letterSpacing: -0.3,
              }}>
              {t('homeUnlogin.ctaStart')}
            </Text>
            <ChevronRight size={18} color={colors.destructiveForeground} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/auth/login' as never)}
            style={({ pressed }) => ({
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.muted,
              opacity: pressed ? 0.75 : 1,
            })}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.mutedForeground,
              }}>
              {t('homeUnlogin.ctaHaveAccount')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
