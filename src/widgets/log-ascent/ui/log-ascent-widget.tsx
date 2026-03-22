import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { StopwatchCard } from '@/features/stopwatch/ui/stopwatch-card';
import { useRouteDetailsQuery } from '@/entities/route/model/routeHooks';
import { useUserStore } from '@/entities/user/model/userStore';
import { useLogAscentForm } from '@/widgets/log-ascent/ui/useLogAscentForm';
import { RouteHeaderCard } from '@/widgets/log-ascent/ui/sections/RouteHeaderCard';
import { AscentTypeSection } from '@/widgets/log-ascent/ui/sections/AscentTypeSection';
import { ResultAttemptsSection } from '@/widgets/log-ascent/ui/sections/ResultAttemptsSection';
import { FeelingSection } from '@/widgets/log-ascent/ui/sections/FeelingSection';
import { GradePerceptionSection } from '@/widgets/log-ascent/ui/sections/GradePerceptionSection';
import { NotesSection } from '@/widgets/log-ascent/ui/sections/NotesSection';
import { VideoSection } from '@/widgets/log-ascent/ui/sections/VideoSection';
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

  const scrollRef = React.useRef<ScrollView | null>(null);

  const timeSeconds = stopwatch.seconds > 0 ? stopwatch.seconds : null;
  const { state, actions, submit, isPending, reset } = useLogAscentForm(
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
    serverError,
  } = state;
  const {
    setAscentType,
    setSuccess,
    setAttemptNumber,
    setFeeling,
    setGradePerception,
    setNotes,
    setVideoUrl,
  } = actions;

  const cardBg = colors.card;
  const borderColor = colors.border;
  const inputBg = colors.input;
  const inputColor = colors.foreground;
  const placeholderColor = colors.mutedForeground;

  useFocusEffect(
    React.useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }, [])
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
    try {
      await submit();
      toast.show('success', t('logAscent.toastSuccess'));
      setTimeout(() => {
        reset();
        resetStopwatch();
        setTimeout(() => {
          router.back();
        }, 10);
      }, 700);
    } catch {
      // помилка вже показана через serverError
    }
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
          <RouteHeaderCard route={route} />

          <ServerErrorBanner message={serverError} />

          {/* Stopwatch */}
          <StopwatchCard {...stopwatch} />

          <AscentTypeSection
            ascentType={ascentType}
            cardBg={cardBg}
            borderColor={borderColor}
            onChange={setAscentType}
          />

          <ResultAttemptsSection
            success={success}
            attemptNumber={attemptNumber}
            cardBg={cardBg}
            borderColor={borderColor}
            onChangeSuccess={setSuccess}
            onChangeAttempt={setAttemptNumber}
          />

          <FeelingSection
            feeling={feeling}
            cardBg={cardBg}
            borderColor={borderColor}
            onChange={setFeeling}
          />

          <GradePerceptionSection
            gradePerception={gradePerception}
            cardBg={cardBg}
            borderColor={borderColor}
            onChange={setGradePerception}
          />

          <NotesSection
            value={notes}
            onChange={setNotes}
            cardBg={cardBg}
            borderColor={borderColor}
            inputBg={inputBg}
            inputColor={inputColor}
            placeholderColor={placeholderColor}
          />

          <VideoSection
            value={videoUrl}
            onChange={setVideoUrl}
            cardBg={cardBg}
            borderColor={borderColor}
            inputBg={inputBg}
            inputColor={inputColor}
            placeholderColor={placeholderColor}
          />
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
