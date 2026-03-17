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
import { parseApiError } from '@/shared/lib/api-error';
import { useUserStore } from '@/entities/user/model/userStore';
import { useMeMutation } from '@/entities/auth/model/authHooks';

const editProfileSchema = z.object({
  firstName: z.string().min(2, 'Мінімум 2 символи'),
  lastName: z.string().min(2, 'Мінімум 2 символи'),
  email: z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
});
type EditProfileValues = z.infer<typeof editProfileSchema>;

export function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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

  const fields = [
    { name: 'firstName' as const, label: 'Імʼя', placeholder: 'Юрко', Icon: User },
    { name: 'lastName' as const, label: 'Прізвище', placeholder: 'Іванченко', Icon: User },
    { name: 'email' as const, label: 'Email', placeholder: 'you@example.com', Icon: Mail },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Редагувати профіль">
      {emailHint ? (
        <View style={{ gap: 12, paddingVertical: 8 }}>
          <Text className="text-center text-sm text-muted-foreground">
            На нову адресу надіслано лист підтвердження. Перейди за посиланням.
          </Text>
          <Button onPress={onClose} className="h-11">
            <Text className="font-semibold">Зрозуміло</Text>
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
                  Зміна email потребує підтвердження поштою
                </Text>
              )}
            </View>
          ))}
          <ServerErrorBanner message={serverError} />
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
            {isSubmitting ? (
              <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
            ) : (
              <Text className="font-semibold">Зберегти</Text>
            )}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
