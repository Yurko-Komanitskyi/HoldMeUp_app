import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { THEME } from '@/shared/config/tokens';
import { parseApiError } from '@/shared/lib/api-error';
import { useUserStore } from '@/entities/user/model/userStore';
import { useMeMutation } from '@/entities/auth/model/authHooks';
import { useTranslation } from 'react-i18next';

export function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const editProfileSchema = React.useMemo(
    () =>
      z.object({
        firstName: z.string().min(2, t('validation.min2')),
        lastName: z.string().min(2, t('validation.min2')),
        email: z.string().min(1, t('validation.required')).email(t('validation.emailInvalid')),
      }),
    [t]
  );
  type EditProfileValues = z.infer<typeof editProfileSchema>;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const user = useUserStore((s) => s.currentUser);
  const setUser = useUserStore((s) => s.setUser);
  const { updateMe } = useMeMutation();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [emailHint, setEmailHint] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
      });
      setServerError(null);
      setEmailHint(false);
    }
  }, [visible, user]);

  async function onSubmit(values: EditProfileValues) {
    setServerError(null);
    try {
      const updatedUser = await updateMe.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        ...(dirtyFields.email ? { email: values.email } : {}),
      });
      setUser(updatedUser);
      if (dirtyFields.email) setEmailHint(true);
      else onClose();
    } catch (e: unknown) {
      const { message, fieldErrors } = parseApiError(e);
      const formFields = new Set<string>(['firstName', 'lastName', 'email']);
      let hasFieldErrors = false;
      for (const [field, msg] of Object.entries(fieldErrors)) {
        if (formFields.has(field)) {
          setError(field as keyof EditProfileValues, { message: msg });
          hasFieldErrors = true;
        }
      }
      if (!hasFieldErrors) setServerError(message);
    }
  }

  const fields = React.useMemo(
    () => [
      { name: 'firstName' as const, label: t('auth.firstName'), placeholder: t('auth.placeholderFirstName'), Icon: User },
      { name: 'lastName' as const, label: t('auth.lastName'), placeholder: t('auth.placeholderLastName'), Icon: User },
      {
        name: 'email' as const,
        label: t('auth.email'),
        placeholder: t('auth.placeholderEmail'),
        Icon: Mail,
      },
    ],
    [t]
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('editProfile.title')}
      keyboardShift
    >
      {emailHint ? (
        <View style={{ gap: 12, paddingVertical: 8 }}>
          <Text className="text-center text-sm text-muted-foreground">
            {t('editProfile.emailSentHint')}
          </Text>
          <Button onPress={onClose} className="h-11">
            <Text className="font-semibold">{t('common.understood')}</Text>
          </Button>
        </View>
      ) : (
        <>
          {fields.map(({ name, label, placeholder, Icon: FieldIcon }) => (
            <View key={name} style={{ gap: 6 }}>
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
                      autoCapitalize={name === 'email' ? 'none' : 'words'}
                      {...(name === 'email' ? { keyboardType: 'email-address' as const } : {})}
                      placeholder={placeholder}
                      style={{ paddingLeft: 40 }}
                    />
                  </View>
                )}
              />
              {errors[name] && (
                <Text className="text-xs text-destructive">{errors[name]?.message}</Text>
              )}
              {name === 'email' && (
                <Text className="text-xs text-muted-foreground">
                  {t('editProfile.emailChangeHint')}
                </Text>
              )}
            </View>
          ))}
          <ServerErrorBanner message={serverError} />
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
            {isSubmitting ? (
              <ActivityIndicator
                color={isDark ? THEME.dark.background : THEME.light.destructiveForeground}
              />
            ) : (
              <Text className="font-semibold">{t('common.save')}</Text>
            )}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
