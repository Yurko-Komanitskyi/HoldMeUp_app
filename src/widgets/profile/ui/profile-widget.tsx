import * as React from 'react';
import {
  ScrollView, View, Pressable, Switch, Modal, ActivityIndicator,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {
  User, Mail, Settings, Moon, Sun, Globe, LogOut, ChevronRight,
  TrendingUp, Zap, Target, Lock, X, MailCheck, type LucideIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { ACCENT } from '@/shared/config/palette';
import { parseApiError } from '@/shared/lib/api-error';
import { useUserStore } from '@/entities/user/model/userStore';
import { useAscentsQuery } from '@/entities/ascent/model/useAscentsQuery';
import { useAuth } from '@/entities/auth/model/useAuth';
import { authApi } from '@/entities/auth/api/authApi';

function StatPill({ icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card py-4">
      <Icon as={icon} size={16} color={ACCENT} />
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function SettingRow({
  icon, label, value, onPress, danger, rightElement,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  const { colorScheme } = useColorScheme();
  const iconColor  = danger ? '#ef4444' : colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const arrowColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70">
      <View className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-card">
        <Icon as={icon} size={15} color={iconColor} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
      {rightElement ?? (
        <View className="flex-row items-center gap-1">
          {value && <Text className="text-sm text-muted-foreground">{value}</Text>}
          {!danger && <Icon as={ChevronRight} size={14} color={arrowColor} />}
        </View>
      )}
    </Pressable>
  );
}

function BottomSheet({
  visible, onClose, title, children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { colorScheme } = useColorScheme();
  const isDark   = colorScheme === 'dark';
  const insets   = useSafeAreaInsets();
  const bgColor  = isDark ? '#111111' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={{
              backgroundColor: bgColor,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor,
              paddingBottom: insets.bottom + 16,
              maxHeight: 600,
            }}>
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text className="text-lg font-bold text-foreground">{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <X size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8, gap: 16 }}>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const editProfileSchema = z.object({
  firstName: z.string().min(2, 'Мінімум 2 символи'),
  lastName:  z.string().min(2, 'Мінімум 2 символи'),
  email:     z.string().min(1, 'Обовʼязкове поле').email('Введіть коректний email'),
});
type EditProfileValues = z.infer<typeof editProfileSchema>;

function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark    = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const user = useUserStore((s) => s.currentUser);
  const { updateMe } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [emailHint, setEmailHint]     = React.useState(false);

  const { control, handleSubmit, reset, setError, formState: { errors, isSubmitting, dirtyFields } } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '' },
  });

  React.useEffect(() => {
    if (visible) {
      reset({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '' });
      setServerError(null);
      setEmailHint(false);
    }
  }, [visible]);

  async function onSubmit(values: EditProfileValues) {
    setServerError(null);
    try {
      await updateMe({
        firstName: values.firstName,
        lastName:  values.lastName,
        ...(dirtyFields.email ? { email: values.email } : {}),
      });
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
    { name: 'firstName' as const, label: "Імʼя",    placeholder: 'Юрко',           Icon: User },
    { name: 'lastName'  as const, label: 'Прізвище', placeholder: 'Іванченко',      Icon: User },
    { name: 'email'     as const, label: 'Email',    placeholder: 'you@example.com', Icon: Mail },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Редагувати профіль">
      {emailHint ? (
        <View style={{ gap: 12, paddingVertical: 8 }}>
          <Text className="text-center text-sm text-muted-foreground">
            На нову адресу надіслано лист підтвердження. Перейди за посиланням.
          </Text>
          <Button onPress={onClose} className="h-11"><Text className="font-semibold">Зрозуміло</Text></Button>
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
                    <View style={{ position: 'absolute', left: 12, top: 0, bottom: 0, zIndex: 10, justifyContent: 'center' }}>
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
              {errors[name] && <Text className="text-xs text-destructive">{errors[name]?.message}</Text>}
              {name === 'email' && (
                <Text className="text-xs text-muted-foreground">Зміна email потребує підтвердження поштою</Text>
              )}
            </View>
          ))}
          <ServerErrorBanner message={serverError} />
          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-11">
            {isSubmitting
              ? <ActivityIndicator color={isDark ? '#0a0a0f' : '#fff'} />
              : <Text className="font-semibold">Зберегти</Text>}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}

function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const user = useUserStore((s) => s.currentUser);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent]       = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);

  function handleClose() { setSent(false); setError(null); onClose(); }

  async function handleSend() {
    if (!user?.email) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(user.email);
      setSent(true);
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Змінити пароль">
      {sent ? (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: ACCENT + '20', alignItems: 'center', justifyContent: 'center' }}>
            <MailCheck size={28} color={ACCENT} />
          </View>
          <Text className="text-center text-sm text-muted-foreground">
            Лист зі скиданням пароля надіслано на{' '}
            <Text style={{ color: ACCENT, fontWeight: '600' }}>{user?.email}</Text>
          </Text>
          <Button onPress={handleClose} className="mt-2 h-11 w-full">
            <Text className="font-semibold">Зрозуміло</Text>
          </Button>
        </View>
      ) : (
        <View style={{ gap: 16, paddingVertical: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: ACCENT + '10' }}>
            <Lock size={16} color={ACCENT} />
            <Text className="flex-1 text-sm text-muted-foreground">
              На адресу <Text style={{ color: ACCENT, fontWeight: '600' }}>{user?.email}</Text> буде надіслано лист зі скиданням пароля.
            </Text>
          </View>
          <ServerErrorBanner message={error} />
          <Button onPress={handleSend} disabled={loading} className="h-11">
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="font-semibold">Надіслати лист</Text>}
          </Button>
        </View>
      )}
    </BottomSheet>
  );
}

export function ProfileWidget() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const user        = useUserStore((s) => s.currentUser);
  const theme       = useUserStore((s) => s.theme);
  const language    = useUserStore((s) => s.language);
  const setTheme    = useUserStore((s) => s.setTheme);
  const setLanguage = useUserStore((s) => s.setLanguage);
  const { logout } = useAuth();
  const { data: ascents = [] } = useAscentsQuery(!!user);

  const [showEditProfile,     setShowEditProfile]     = React.useState(false);
  const [showChangePassword,  setShowChangePassword]  = React.useState(false);

  const initials = (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '')
    || (user?.email?.charAt(0)?.toUpperCase() ?? '?');

  const flashCount   = ascents.filter((a) => a.type?.toUpperCase() === 'FLASH').length;
  const successCount = ascents.filter((a) => a.success).length;
  const isDark = theme === 'dark';

  async function doLogout() {
    await logout();
    router.replace('/auth/login');
  }

  function handleLogout() {
    Alert.alert(
      'Вийти з акаунту',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Вийти', style: 'destructive', onPress: () => { void doLogout(); } },
      ]
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}>

      <EditProfileModal    visible={showEditProfile}    onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal visible={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <View className="gap-6 pt-6">
        <View className="items-center gap-3 px-4">
          <View style={{
            width: 84, height: 84, borderRadius: 26,
            backgroundColor: ACCENT + '20',
            borderWidth: 2, borderColor: ACCENT + '50',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: ACCENT, lineHeight: 36 }}>
              {initials}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-xl font-bold text-foreground">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || t('profile.defaultName')}
            </Text>
            {user?.email && <Text className="text-sm text-muted-foreground">{user.email}</Text>}
          </View>
        </View>

        <View className="flex-row gap-3 px-4">
          <StatPill icon={TrendingUp} value={ascents.length} label={t('profile.statAscents')} />
          <StatPill icon={Zap}        value={flashCount}     label={t('profile.statFlash')}    />
          <StatPill icon={Target}     value={successCount}   label={t('profile.statSuccess')}  />
        </View>

        <View className="gap-1">
          <Text className="mb-1 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.accountSection')}
          </Text>
          <View className="mx-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <SettingRow icon={User} label={t('profile.editProfile')} onPress={() => setShowEditProfile(true)} />
            <SettingRow icon={Lock} label="Змінити пароль"           onPress={() => setShowChangePassword(true)} />
          </View>
        </View>

        <View className="gap-1">
          <Text className="mb-1 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.settingsSection')}
          </Text>
          <View className="mx-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <SettingRow
              icon={isDark ? Moon : Sun}
              label={t('profile.darkTheme')}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                  trackColor={{ true: ACCENT, false: undefined }}
                  thumbColor="#ffffff"
                />
              }
            />
            <SettingRow
              icon={Globe}
              label={t('profile.language')}
              value={language === 'ua' ? t('profile.langUA') : t('profile.langEN')}
              onPress={() => setLanguage(language === 'ua' ? 'en' : 'ua')}
            />
            <SettingRow icon={Settings} label={t('profile.moreSettings')} />
          </View>
        </View>

        <View className="gap-1">
          <View className="mx-4 overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5">
            <SettingRow icon={LogOut} label={t('profile.logout')} onPress={handleLogout} danger />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
