import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Lock, MailCheck } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { Button } from '@/shared/ui/button';
import { ServerErrorBanner } from '@/shared/ui/server-error-banner';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { ACCENT } from '@/shared/config/palette';
import { THEME } from '@/shared/config/tokens';
import { parseApiError } from '@/shared/lib/api-error';
import { useUserStore } from '@/entities/user/model/userStore';
import { authApi } from '@/entities/auth/api/authApi';
import { useTranslation } from 'react-i18next';

export function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.currentUser);
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleClose() {
    setSent(false);
    setError(null);
    onClose();
  }

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
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={t('changePassword.title')}
      keyboardShift
    >
      {sent ? (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
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
            {t('changePassword.resetSentPrefix')}{' '}
            <Text style={{ color: ACCENT, fontWeight: '600' }}>{user?.email}</Text>
          </Text>
          <Button onPress={handleClose} className="mt-2 h-11 w-full">
            <Text className="font-semibold">{t('changePassword.understood')}</Text>
          </Button>
        </View>
      ) : (
        <View style={{ gap: 16, paddingVertical: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: ACCENT + '10',
            }}>
            <Lock size={16} color={ACCENT} />
            <Text className="flex-1 text-sm text-muted-foreground">
              {t('changePassword.description')}{' '}
              <Text style={{ color: ACCENT, fontWeight: '600' }}>{user?.email}</Text>{' '}
              {t('changePassword.descriptionSuffix')}
            </Text>
          </View>
          <ServerErrorBanner message={error} />
          <Button onPress={handleSend} disabled={loading} className="h-11">
            {loading ? (
              <ActivityIndicator color={THEME.light.destructiveForeground} />
            ) : (
              <Text className="font-semibold">{t('changePassword.sendLetter')}</Text>
            )}
          </Button>
        </View>
      )}
    </BottomSheet>
  );
}
