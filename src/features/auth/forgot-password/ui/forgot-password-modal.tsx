import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MailCheck, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { ACCENT } from '@/shared/config/palette';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/authHooks';

const forgotSchema = z.object({
  email: z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ visible, onClose }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { forgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotValues) {
    setError(null);
    try {
      await forgotPassword.mutateAsync(values.email);
      setSent(true);
    } catch (e: unknown) {
      const { message, fieldErrors } = parseApiError(e);
      if (fieldErrors.email) setFormError('email', { message: fieldErrors.email });
      else setError(message);
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
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 24,
        }}
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
            <Text className="text-lg font-bold text-foreground">Відновити пароль</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <X size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
            </TouchableOpacity>
          </View>

          {sent ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: ACCENT + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
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
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        style={{ paddingLeft: 40 }}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text className="text-xs text-destructive">{errors.email.message}</Text>
                )}
              </View>
              <ServerErrorBanner message={error} />
              <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
                {isSubmitting ? (
                  <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
                ) : (
                  <Text className="font-semibold">Надіслати лист</Text>
                )}
              </Button>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

