import * as React from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { PasswordInput } from '@/shared/ui/password-input';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { AnimatedEntry } from '@/shared/ui/animated-entry';
import { ACCENT } from '@/shared/config/palette';
import { THEME } from '@/shared/config/tokens';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/authHooks';
import { useGoogleAuth } from '@/entities/auth/model/useGoogleAuth';
import { ForgotPasswordModal } from '@/features/auth/forgot-password/ui/forgot-password-modal';
import { useMyGymMembershipsQuery } from '@/entities/gym-member/model/gymMemberHooks';
import { useTranslation } from 'react-i18next';

export function LoginWidget() {
  const { t } = useTranslation();
  const loginSchema = React.useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('validation.required')).email(t('validation.emailInvalid')),
        password: z.string().min(1, t('validation.required')).min(6, t('validation.min6')),
      }),
    [t]
  );
  type LoginValues = z.infer<typeof loginSchema>;

  const router = useRouter();
  const { login } = useAuth();
  const myMembershipsQuery = useMyGymMembershipsQuery();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const { signIn: signInWithGoogle, loading: googleLoading, error: googleError, setError: setGoogleError } =
    useGoogleAuth();

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showForgot, setShowForgot] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await login.mutateAsync({ email: values.email, password: values.password });
      await myMembershipsQuery.refetch();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const { message, fieldErrors } = parseApiError(e);
      let hasFieldErrors = false;
      for (const [field, msg] of Object.entries(fieldErrors)) {
        if (field === 'email' || field === 'password') {
          setError(field as keyof LoginValues, { message: msg });
          hasFieldErrors = true;
        }
      }
      if (!hasFieldErrors) setServerError(message);
    }
  }

  const onGooglePress = React.useCallback(async () => {
    setServerError(null);
    setGoogleError(null);
    const user = await signInWithGoogle();
    if (user) {
      await myMembershipsQuery.refetch();
      router.replace('/(tabs)');
    }
  }, [myMembershipsQuery, router, setGoogleError, signInWithGoogle]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      className="bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingBottom: 40,
            paddingTop: 80,
          }}>

          {/* Title */}
          <AnimatedEntry delay={0} duration={500} style={{ marginBottom: 40 }}>
            <Text className="mb-2 text-4xl font-bold tracking-tight">{t('auth.loginTitle')}</Text>
            <Text className="text-base text-muted-foreground">{t('auth.loginSubtitle')}</Text>
          </AnimatedEntry>

          <View style={{ gap: 20 }}>
            {/* Email field */}
            <AnimatedEntry delay={80}>
              <View style={{ gap: 8 }}>
                <Text className="text-sm font-medium text-foreground">{t('auth.email')}</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ position: 'relative' }}>
                      <View
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: 0,
                          bottom: 0,
                          zIndex: 10,
                          justifyContent: 'center',
                        }}>
                        <Mail size={16} color={iconColor} />
                      </View>
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder={t('auth.placeholderEmail')}
                        style={{ paddingLeft: 40 }}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text className="text-xs text-destructive">{errors.email.message}</Text>
                )}
              </View>
            </AnimatedEntry>

            {/* Password field */}
            <AnimatedEntry delay={160}>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text className="text-sm font-medium text-foreground">{t('auth.password')}</Text>
                  <TouchableOpacity onPress={() => setShowForgot(true)} hitSlop={8}>
                    <Text className="text-sm" style={{ color: ACCENT }}>
                      {t('auth.forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoComplete="password"
                      placeholder={t('auth.placeholderPassword')}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-xs text-destructive">{errors.password.message}</Text>
                )}
              </View>
            </AnimatedEntry>

            <AnimatedEntry delay={230}>
              <ServerErrorBanner message={serverError ?? googleError} />

              <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="mt-1 h-12">
                {isSubmitting ? (
                  <ActivityIndicator
                    color={isDark ? THEME.dark.background : THEME.light.destructiveForeground}
                  />
                ) : (
                  <Text className="font-semibold">{t('auth.signIn')}</Text>
                )}
              </Button>
            </AnimatedEntry>

            {/* Divider + Google */}
            <AnimatedEntry delay={310}>
              <View style={{ marginTop: 4, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    }}
                  />
                  <Text className="text-xs text-muted-foreground">{t('auth.orContinueWith')}</Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => void onGooglePress()}
                  disabled={isSubmitting || googleLoading}
                  activeOpacity={0.9}
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    opacity: isSubmitting || googleLoading ? 0.7 : 1,
                  }}>
                  <View
                    style={{
                      minHeight: 50,
                      borderRadius: 14,
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      backgroundColor: ACCENT + '16',
                      borderWidth: 1,
                      borderColor: ACCENT + '55',
                    }}>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: isDark ? ACCENT + '33' : '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{ color: ACCENT, fontSize: 14, fontWeight: '800' }}>G</Text>
                    </View>
                    {googleLoading ? (
                      <ActivityIndicator color={ACCENT} />
                    ) : (
                      <Text style={{ color: isDark ? '#fff' : '#111', fontWeight: '700', fontSize: 15 }}>
                        {t('auth.googleContinue')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </AnimatedEntry>
          </View>

          <AnimatedEntry delay={400}>
            <View
              style={{
                marginTop: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
              <Text className="text-sm text-muted-foreground">{t('auth.noAccount')}</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
                  {t('auth.signUpLink')}
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedEntry>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
