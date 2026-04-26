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
import { THEME } from '@/shared/config/tokens';
import { parseApiError } from '@/shared/lib/api-error';
import { useAuth } from '@/entities/auth/model/authHooks';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const forgotSchema = React.useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('validation.required')).email(t('validation.emailInvalid')),
      }),
    [t]
  );
  type ForgotValues = z.infer<typeof forgotSchema>;

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
            <Text className="text-lg font-bold text-foreground">{t('forgotPassword.title')}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={handleClose}
              hitSlop={8}>
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
                {t('forgotPassword.sent')}
              </Text>
              <Button onPress={handleClose} className="mt-2 h-11 w-full">
                <Text className="font-semibold">{t('common.understood')}</Text>
              </Button>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <Text className="text-sm text-muted-foreground">{t('forgotPassword.hint')}</Text>
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
              <ServerErrorBanner message={error} />
              <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
                {isSubmitting ? (
                  <ActivityIndicator
                    color={isDark ? THEME.dark.background : THEME.light.destructiveForeground}
                  />
                ) : (
                  <Text className="font-semibold">{t('forgotPassword.sendLetter')}</Text>
                )}
              </Button>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
