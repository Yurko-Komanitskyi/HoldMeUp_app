import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  LayoutChangeEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { StopwatchCard } from '@/features/stopwatch/ui/stopwatch-card';
import { useRouteDetailsQuery } from '@/entities/route/model/routeHooks';
import { useUserStore } from '@/entities/user/model/userStore';
import { useLogAscentForm } from '@/widgets/log-ascent/ui/useLogAscentForm';

type LogAscentScrollSectionKey = 'ascentType' | 'attemptNumber' | 'notes' | 'videoUrl';
import { RouteHeaderCard } from '@/widgets/log-ascent/ui/sections/RouteHeaderCard';
import { AscentTypeSection } from '@/widgets/log-ascent/ui/sections/AscentTypeSection';
import { ResultAttemptsSection } from '@/widgets/log-ascent/ui/sections/ResultAttemptsSection';
import { FeelingSection } from '@/widgets/log-ascent/ui/sections/FeelingSection';
import { GradePerceptionSection } from '@/widgets/log-ascent/ui/sections/GradePerceptionSection';
import { NotesSection } from '@/widgets/log-ascent/ui/sections/NotesSection';
import { VideoSection } from '@/widgets/log-ascent/ui/sections/VideoSection';
import { IsPublicSection } from '@/widgets/log-ascent/ui/sections/IsPublicSection';
import { useStopwatch } from '@/features/stopwatch/model/useStopwatch';
import { useToastStore } from '@/shared/ui/app-toast';
import { useTranslation } from 'react-i18next';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

export function LogAscentWidget() {
  const { t } = useTranslation();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const router = useRouter();
  const colors = useThemeColor();
  const user = useUserStore((s) => s.currentUser);
  const {
    data: route,
    isLoading: routeLoading,
    isError: routeError,
    error: routeQueryError,
    refetch: refetchRoute,
  } = useRouteDetailsQuery(routeId ?? '');

  const stopwatch = useStopwatch();
  const { reset: resetStopwatch } = stopwatch;
  const toast = useToastStore();

  const scrollRef = useScrollToTopOnFocus<ScrollView>();
  const sectionScrollY = React.useRef<Partial<Record<LogAscentScrollSectionKey, number>>>({});

  const captureSectionY = React.useCallback((key: LogAscentScrollSectionKey) => {
    return (e: LayoutChangeEvent) => {
      sectionScrollY.current[key] = e.nativeEvent.layout.y;
    };
  }, []);

  const scrollToValidationSection = React.useCallback((key: LogAscentScrollSectionKey) => {
    const y = sectionScrollY.current[key];
    requestAnimationFrame(() => {
      if (typeof y === 'number') {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
      }
    });
  }, [scrollRef]);

  const scrollFormToTop = React.useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  }, [scrollRef]);

  const timeSeconds = stopwatch.seconds > 0 ? stopwatch.seconds : null;
  const { state, previousAttempts, validationErrors, actions, submit, isPending, reset } =
    useLogAscentForm(
    user?.id,
    routeId,
    timeSeconds
    );
  const {
    ascentType,
    success,
    attemptNumber,
    feeling,
    gradePerception,
    notes,
    videoUrl,
    isPublic,
    serverError,
  } = state;
  const {
    setAscentType,
    setSuccess,
    setFeeling,
    setGradePerception,
    setNotes,
    setVideoUrl,
    setIsPublic,
  } = actions;

  const cardBg = colors.card;
  const borderColor = colors.border;
  const inputBg = colors.input;
  const inputColor = colors.foreground;
  const placeholderColor = colors.mutedForeground;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        reset();
        resetStopwatch();
      };
    }, [reset, resetStopwatch])
  );

  if (!routeId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center', color: colors.mutedForeground }}>{t('logAscent.missingRoute')}</Text>
      </View>
    );
  }

  if (routeLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeft size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (routeError || !route) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
            }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeft size={18} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.foreground }}>
              {t('logAscent.title')}
            </Text>
          </View>
        </SafeAreaView>
        <QueryErrorPanel
          error={routeQueryError ?? new Error('')}
          onRetry={() => void refetchRoute()}
        />
      </View>
    );
  }

  async function handleSubmit() {
    const result = await submit();
    if (result.outcome === 'skipped') return;
    if (result.outcome === 'validation') {
      scrollToValidationSection(result.firstField);
      return;
    }
    if (result.outcome === 'server') {
      scrollFormToTop();
      return;
    }
    toast.show('success', t('logAscent.toastSuccess'));
    setTimeout(() => {
      reset();
      resetStopwatch();
      setTimeout(() => {
        router.back();
      }, 10);
    }, 700);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
          }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeft size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.foreground }}>
              {t('logAscent.title')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120, gap: 12, paddingHorizontal: 16 }}>
          <Animated.View entering={FadeInDown.delay(0).duration(360).springify().damping(18)}>
            <RouteHeaderCard route={route} />
          </Animated.View>

          <ServerErrorBanner message={serverError} />

          {/* Stopwatch */}
          <Animated.View entering={FadeInDown.delay(60).duration(360).springify().damping(18)}>
            <StopwatchCard {...stopwatch} />
          </Animated.View>

          {success && (
            <View onLayout={captureSectionY('ascentType')}>
              <AscentTypeSection
                ascentType={ascentType ?? ''}
                disableFlash={previousAttempts > 0}
                errorText={
                  validationErrors.ascentType ? t(validationErrors.ascentType) : undefined
                }
                cardBg={cardBg}
                borderColor={borderColor}
                onChange={setAscentType}
              />
            </View>
          )}

          <Animated.View
            entering={FadeInDown.delay(120).duration(360).springify().damping(18)}
            onLayout={captureSectionY('attemptNumber')}>
            <ResultAttemptsSection
              success={success}
              attemptNumber={attemptNumber}
              attemptErrorText={
                validationErrors.attemptNumber ? t(validationErrors.attemptNumber) : undefined
              }
              cardBg={cardBg}
              borderColor={borderColor}
              onChangeSuccess={setSuccess}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(360).springify().damping(18)}>
            <FeelingSection
              feeling={feeling}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={setFeeling}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(230).duration(360).springify().damping(18)}>
            <GradePerceptionSection
              gradePerception={gradePerception}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={setGradePerception}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(280).duration(360).springify().damping(18)}
            onLayout={captureSectionY('notes')}>
            <NotesSection
              value={notes}
              onChange={setNotes}
              errorText={validationErrors.notes ? t(validationErrors.notes) : undefined}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              inputColor={inputColor}
              placeholderColor={placeholderColor}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(330).duration(360).springify().damping(18)}
            onLayout={captureSectionY('videoUrl')}>
            <VideoSection
              value={videoUrl}
              onChange={setVideoUrl}
              errorText={validationErrors.videoUrl ? t(validationErrors.videoUrl) : undefined}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              inputColor={inputColor}
              placeholderColor={placeholderColor}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(360).springify().damping(18)}>
            <IsPublicSection
              isPublic={isPublic}
              cardBg={cardBg}
              borderColor={borderColor}
              onChange={setIsPublic}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 36 : 20,
          borderTopWidth: 1,
          borderTopColor: borderColor,
        }}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          style={{
            backgroundColor: success ? colors.chart2 : colors.destructive,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isPending ? 0.6 : 1,
          }}
          activeOpacity={0.85}>
          {isPending ? (
            <ActivityIndicator color={colors.destructiveForeground} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {success ? (
                <CheckCircle2 size={20} color={colors.destructiveForeground} />
              ) : (
                <XCircle size={20} color={colors.destructiveForeground} />
              )}
              <Text style={{ color: colors.destructiveForeground, fontSize: 16, fontWeight: '800' }}>
                {success ? t('logAscent.saveAscent') : t('logAscent.saveAttempt')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
