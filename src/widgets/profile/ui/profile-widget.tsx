import * as React from 'react';
import { ScrollView, View, Switch, Alert } from 'react-native';
import { User, Settings, Moon, Sun, Globe, LogOut, TrendingUp, Zap, Target, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { StatPill } from '@/shared/ui/stat-pill';
import { SettingRow } from '@/shared/ui/setting-row';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useAuth } from '@/entities/auth/model/authHooks';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { EditProfileModal } from '@/features/edit-profile/ui/edit-profile-modal';
import { ChangePasswordModal } from '@/features/change-password/ui/change-password-modal';

export function ProfileWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUserStore((s) => s.currentUser);
  const theme = useUserStore((s) => s.theme);
  const language = useUserStore((s) => s.language);
  const setTheme = useUserStore((s) => s.setTheme);
  const setLanguage = useUserStore((s) => s.setLanguage);
  const setUser = useUserStore((s) => s.setUser);
  const clearGymMembers = useGymMemberStore((s) => s.clearAll);
  const { logout } = useAuth();
  const { data: { data: ascents = [] } = {} } = useAscentsQuery();

  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);

  const initials =
    (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '') ||
    (user?.email?.charAt(0)?.toUpperCase() ?? '?');

  const flashCount = ascents.filter((a) => a.type?.toUpperCase() === 'FLASH').length;
  const successCount = ascents.filter((a) => a.success).length;
  const isDark = theme === 'dark';

  



// ... inside doLogout
  async function doLogout() {
    await logout.mutateAsync();
    setUser(null);
    clearGymMembers();
    router.replace('/auth/login');
  }

  function handleLogout() {
    Alert.alert('Вийти з акаунту', 'Ви впевнені, що хочете вийти?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: () => {
          void doLogout();
        },
      },
    ]);
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}>
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <View className="gap-6 pt-6">
        <View className="items-center gap-3 px-4">
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 26,
              backgroundColor: ACCENT + '20',
              borderWidth: 2,
              borderColor: ACCENT + '50',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: ACCENT, lineHeight: 36 }}>
              {initials}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-xl font-bold text-foreground">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
                t('profile.defaultName')}
            </Text>
            {user?.email && <Text className="text-sm text-muted-foreground">{user.email}</Text>}
          </View>
        </View>

        <View className="flex-row gap-3 px-4">
          <StatPill icon={TrendingUp} value={ascents.length} label={t('profile.statAscents')} />
          <StatPill icon={Zap} value={flashCount} label={t('profile.statFlash')} />
          <StatPill icon={Target} value={successCount} label={t('profile.statSuccess')} />
        </View>

        <View className="gap-1">
          <Text className="mb-1 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('profile.accountSection')}
          </Text>
          <View className="mx-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <SettingRow
              icon={User}
              label={t('profile.editProfile')}
              onPress={() => setShowEditProfile(true)}
            />
            <SettingRow
              icon={Lock}
              label="Змінити пароль"
              onPress={() => setShowChangePassword(true)}
            />
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
