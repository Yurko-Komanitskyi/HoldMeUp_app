import * as React from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
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

export function LogAscentWidget() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((s) => s.currentUser);
  const { data: route } = useRouteDetailsQuery(routeId ?? '');

  const stopwatch = useStopwatch();

  const timeSeconds = stopwatch.saved && stopwatch.seconds > 0 ? stopwatch.seconds : null;
  const { state, actions, submit, isPending } = useLogAscentForm(user?.id, routeId, timeSeconds);
  const { ascentType, success, attemptNumber, feeling, gradePerception, notes, videoUrl, serverError } =
    state;
  const { setAscentType, setSuccess, setAttemptNumber, setFeeling, setGradePerception, setNotes, setVideoUrl } =
    actions;

  const cardBg = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const inputColor = isDark ? '#fff' : '#000';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  async function handleSubmit() {
    try {
      await submit();
      router.back();
    } catch {
      // помилка вже показана через serverError
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f2f2f7' }}>
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeft size={18} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#fff' : '#000' }}>
              Записати пролаз
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120, gap: 12, paddingHorizontal: 16 }}>
          <RouteHeaderCard route={route} />

          <ServerErrorBanner message={serverError} />

          {/* Stopwatch */}
          <StopwatchCard {...stopwatch} />

          <AscentTypeSection
            ascentType={ascentType}
            isDark={isDark}
            cardBg={cardBg}
            borderColor={borderColor}
            onChange={setAscentType}
          />

          <ResultAttemptsSection
            success={success}
            attemptNumber={attemptNumber}
            isDark={isDark}
            cardBg={cardBg}
            borderColor={borderColor}
            onChangeSuccess={setSuccess}
            onChangeAttempt={setAttemptNumber}
          />

          <FeelingSection
            feeling={feeling}
            isDark={isDark}
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
          backgroundColor: isDark ? '#000' : '#f2f2f7',
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
            backgroundColor: success ? '#22c55e' : '#ef4444',
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isPending ? 0.6 : 1,
          }}
          activeOpacity={0.85}>
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {success ? (
                <CheckCircle2 size={20} color="#fff" />
              ) : (
                <XCircle size={20} color="#fff" />
              )}
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                {success ? 'Записати пролаз' : 'Записати спробу'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
