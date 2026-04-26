import * as React from 'react';
import { Modal, ScrollView, View, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Moon,
  Sun,
  Globe,
  LogOut,
  X,
  Lock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { SettingRow } from '@/shared/ui/setting-row';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useAuth } from '@/entities/auth/model/authHooks';
import { EditProfileModal } from '@/features/edit-profile/ui/edit-profile-modal';
import { ChangePasswordModal } from '@/features/change-password/ui/change-password-modal';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ visible, onClose }: ProfileSettingsModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const theme = useUserStore((s) => s.theme);
  const language = useUserStore((s) => s.language);
  const setTheme = useUserStore((s) => s.setTheme);
  const setLanguage = useUserStore((s) => s.setLanguage);
  const setUser = useUserStore((s) => s.setUser);
  const clearGymMembers = useGymMemberStore((s) => s.clearAll);
  const { logout } = useAuth();

  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const isDark = theme === 'dark';

  async function doLogout() {
    await logout.mutateAsync();
    setUser(null);
    clearGymMembers();
    onClose();
    router.replace('/auth/login');
  }

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  return (
    <>
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <ConfirmDialog
        visible={showLogoutConfirm}
        title={t('profile.logoutConfirmTitle')}
        message={t('profile.logoutConfirmMessage')}
        confirmLabel={t('profile.logoutConfirmAction')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={logout.isPending}
        onConfirm={() => void doLogout()}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 4,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <X size={24} color={colors.mutedForeground} />
            </Pressable>
            <Text
              style={{
                flex: 1,
                fontSize: 17,
                fontWeight: '700',
                color: colors.foreground,
                textAlign: 'center',
                marginRight: 44,
              }}>
              {t('profile.settingsModalTitle')}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}>
            <View className="gap-6 pt-4">
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
                    label={t('profile.changePassword')}
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
                  <SettingRow
                    icon={Settings}
                    label={t('profile.moreSettings')}
                    onPress={() => {
                      onClose();
                      router.push('/gym/manage' as never);
                    }}
                  />
                </View>
              </View>

              <View className="gap-1">
                <View className="mx-4 overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5">
                  <SettingRow icon={LogOut} label={t('profile.logout')} onPress={handleLogout} danger />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
