import * as React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, X, MailCheck } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { PasswordInput } from '@/shared/ui/password-input';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { ACCENT } from '@/shared/config/palette';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/useAuth';
import { authApi } from '@/entities/auth/api/authApi';

const loginSchema = z.object({
  email:    z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
  password: z.string().min(1, 'Обовʼязкове поле').min(6, 'Мінімум 6 символів'),
});
type LoginValues = z.infer<typeof loginSchema>;

const forgotSchema = z.object({
  email: z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
});
type ForgotValues = z.infer<typeof forgotSchema>;

function ForgotPasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark    = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const [sent, setSent]   = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotValues) {
    setError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      setError(message);
    }
  }

  function handleClose() {
    reset();
    setSent(false);
    setError(null);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 24 }}
        onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: isDark ? '#111' : '#fff',
            padding: 24,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text className="text-lg font-bold text-foreground">Відновити пароль</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <X size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: ACCENT + '20', alignItems: 'center', justifyContent: 'center' }}>
                <MailCheck size={28} color={ACCENT} />
              </View>
              <Text className="text-center text-sm text-muted-foreground">
                Лист з інструкціями надіслано. Перевір пошту.
              </Text>
              <Button onPress={handleClose} className="mt-2 h-11 w-full">
                <Text className="font-semibold">Зрозуміло</Text>
              </Button>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <Text className="text-sm text-muted-foreground">
                Введи email від свого акаунту — ми надішлемо посилання для відновлення пароля.
              </Text>
              <View style={{ gap: 8 }}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ position: 'relative' }}>
                      <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, zIndex: 10, justifyContent: 'center' }}>
                        <Mail size={16} color={iconColor} />
                      </View>
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        style={{ paddingLeft: 40 }}
                      />
                    </View>
                  )}
                />
                {errors.email && <Text className="text-xs text-destructive">{errors.email.message}</Text>}
              </View>
              <ServerErrorBanner message={error} />
              <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
                {isSubmitting
                  ? <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
                  : <Text className="font-semibold">Надіслати лист</Text>}
              </Button>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function LoginWidget() {
  const router = useRouter();
  const { login } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showForgot, setShowForgot]   = React.useState(false);

  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
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
    <KeyboardAvoidingView style={{ flex: 1 }} className="bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 80 }}>

          <View style={{ marginBottom: 40 }}>
            <Text className="mb-2 text-4xl font-bold tracking-tight">Привіт знову</Text>
            <Text className="text-base text-muted-foreground">Введи email та пароль, щоб продовжити</Text>
          </View>

          <View style={{ gap: 20 }}>
            <View style={{ gap: 8 }}>
              <Text className="text-sm font-medium text-foreground">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ position: 'relative' }}>
                    <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, zIndex: 10, justifyContent: 'center' }}>
                      <Mail size={16} color={iconColor} />
                    </View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      placeholder="you@example.com"
                      style={{ paddingLeft: 40 }}
                    />
                  </View>
                )}
              />
              {errors.email && <Text className="text-xs text-destructive">{errors.email.message}</Text>}
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text className="text-sm font-medium text-foreground">Пароль</Text>
                <TouchableOpacity onPress={() => setShowForgot(true)} hitSlop={8}>
                  <Text className="text-sm" style={{ color: ACCENT }}>Забули пароль?</Text>
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
                    placeholder="••••••••"
                  />
                )}
              />
              {errors.password && <Text className="text-xs text-destructive">{errors.password.message}</Text>}
            </View>

            <ServerErrorBanner message={serverError} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="mt-1 h-12">
              {isSubmitting
                ? <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
                : <Text className="font-semibold">Увійти</Text>}
            </Button>
          </View>

          <View style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Text className="text-sm text-muted-foreground">Ще немає акаунту?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text className="text-sm font-semibold" style={{ color: ACCENT }}>Зареєструватись</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
