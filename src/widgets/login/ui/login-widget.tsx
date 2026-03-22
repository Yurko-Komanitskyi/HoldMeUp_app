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
import { ACCENT } from '@/shared/config/palette';
import { THEME } from '@/shared/config/tokens';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/authHooks';
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
          <View style={{ marginBottom: 40 }}>
            <Text className="mb-2 text-4xl font-bold tracking-tight">{t('auth.loginTitle')}</Text>
            <Text className="text-base text-muted-foreground">{t('auth.loginSubtitle')}</Text>
          </View>

          <View style={{ gap: 20 }}>
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

            <ServerErrorBanner message={serverError} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="mt-1 h-12">
              {isSubmitting ? (
                <ActivityIndicator
                  color={isDark ? THEME.dark.background : THEME.light.destructiveForeground}
                />
              ) : (
                <Text className="font-semibold">{t('auth.signIn')}</Text>
              )}
            </Button>
          </View>

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
