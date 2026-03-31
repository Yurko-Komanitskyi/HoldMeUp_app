import * as React from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { useAuth } from './authHooks';

export function useGoogleAuth() {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const signIn = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut().catch(() => undefined);
      const result = await GoogleSignin.signIn();
      const idToken = (result as { idToken?: string; data?: { idToken?: string } }).idToken
        ?? (result as { idToken?: string; data?: { idToken?: string } }).data?.idToken;

      if (!idToken) {
        throw new Error('No idToken received');
      }

      const authResult = await googleLogin.mutateAsync({ idToken });
      return authResult.user;
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Скасовано користувачем');
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError('Вхід вже виконується');
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services недоступний');
      } else {
        setError(e.message ?? 'Помилка входу через Google');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [googleLogin]);

  const signOut = React.useCallback(async () => {
    await GoogleSignin.signOut();
  }, []);

  return {
    signIn,
    signOut,
    loading,
    error,
    setError,
  };
}

