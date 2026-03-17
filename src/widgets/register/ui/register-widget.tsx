import * as React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, MailCheck } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { PasswordInput } from '@/shared/ui/password-input';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { ACCENT } from '@/shared/config/palette';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/authHooks';

const schema = z
  .object({
    firstName: z.string().min(2, 'Мінімум 2 символи'),
    lastName: z.string().min(2, 'Мінімум 2 символи'),
    email: z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
    password: z.string().min(6, 'Мінімум 6 символів'),
    confirmPassword: z.string().min(1, 'Підтвердіть пароль'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Паролі не збігаються',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function SuccessScreen({ email, onLogin }: { email: string; onLogin: () => void }) {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      className="bg-background">
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: ACCENT + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
        <MailCheck size={40} color={ACCENT} />
      </View>
      <Text className="mb-3 text-center text-2xl font-bold text-foreground">Перевір пошту</Text>
      <Text className="mb-1 text-center text-base text-muted-foreground">
        Ми надіслали лист підтвердження на
      </Text>
      <Text className="mb-8 text-center text-base font-semibold" style={{ color: ACCENT }}>
        {email}
      </Text>
      <Text className="mb-10 text-center text-sm text-muted-foreground">
        Перейди за посиланням у листі, а потім увійди у застосунок.
      </Text>
      <Button onPress={onLogin} className="h-12 w-full">
        <Text className="font-semibold">Перейти до входу</Text>
      </Button>
    </View>
  );
}

const TEXT_FIELDS = [
  {
    name: 'firstName' as const,
    label: 'Імʼя',
    icon: User,
    placeholder: 'Юрко',
    autoCapitalize: 'words' as const,
  },
  {
    name: 'lastName' as const,
    label: 'Прізвище',
    icon: User,
    placeholder: 'Іванченко',
    autoCapitalize: 'words' as const,
  },
  {
    name: 'email' as const,
    label: 'Email',
    icon: Mail,
    placeholder: 'you@example.com',
    autoCapitalize: 'none' as const,
  },
];

export function RegisterWidget() {
  const router = useRouter();
  const { register } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await register.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      setRegisteredEmail(values.email);
    } catch (e: unknown) {
      const { message, fieldErrors } = parseApiError(e);
      const formFields = new Set<string>([
        'firstName',
        'lastName',
        'email',
        'password',
        'confirmPassword',
      ]);
      let hasFieldErrors = false;
      for (const [field, msg] of Object.entries(fieldErrors)) {
        if (formFields.has(field)) {
          setError(field as keyof FormValues, { message: msg });
          hasFieldErrors = true;
        }
      }
      if (!hasFieldErrors) setServerError(message);
    }
  }

  if (registeredEmail) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SuccessScreen email={registeredEmail} onLogin={() => router.replace('/auth/login')} />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      className="bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
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
            <Text className="mb-2 text-4xl font-bold tracking-tight">Реєстрація</Text>
            <Text className="text-base text-muted-foreground">
              Створи акаунт HoldMeUp, щоб відстежувати свої підйоми
            </Text>
          </View>

          <View style={{ gap: 20 }}>
            {TEXT_FIELDS.map(({ name, label, icon: FieldIcon, placeholder, autoCapitalize }) => (
              <View key={name} style={{ gap: 8 }}>
                <Text className="text-sm font-medium text-foreground">{label}</Text>
                <Controller
                  control={control}
                  name={name}
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
                        <FieldIcon size={16} color={iconColor} />
                      </View>
                      <Input
                        value={value ?? ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize={autoCapitalize}
                        {...(name === 'email'
                          ? {
                              keyboardType: 'email-address' as const,
                              autoComplete: 'email' as const,
                            }
                          : {})}
                        placeholder={placeholder}
                        style={{ paddingLeft: 40 }}
                      />
                    </View>
                  )}
                />
                {errors[name] && (
                  <Text className="text-xs text-destructive">{errors[name]?.message}</Text>
                )}
              </View>
            ))}

            <View style={{ gap: 8 }}>
              <Text className="text-sm font-medium text-foreground">Пароль</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-xs text-destructive">{errors.password.message}</Text>
              )}
            </View>

            <View style={{ gap: 8 }}>
              <Text className="text-sm font-medium text-foreground">Підтвердіть пароль</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-xs text-destructive">{errors.confirmPassword.message}</Text>
              )}
            </View>

            <ServerErrorBanner message={serverError} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="mt-1 h-12">
              {isSubmitting ? (
                <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
              ) : (
                <Text className="font-semibold">Створити акаунт</Text>
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
            <Text className="text-sm text-muted-foreground">Вже маєш акаунт?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm font-semibold" style={{ color: ACCENT }}>
                Увійти
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
