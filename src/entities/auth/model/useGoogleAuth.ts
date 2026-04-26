import * as React from 'react';
import Constants from 'expo-constants';

import { useAuth } from './authHooks';

export function useGoogleAuth() {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const signIn = React.useCallback(async () => {
    if (Constants.appOwnership === 'expo') {
      setError('Google Sign-In недоступний в Expo Go. Використай dev build.');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
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
      if (e.code === 'SIGN_IN_CANCELLED') {
        setError('Скасовано користувачем');
      } else if (e.code === 'IN_PROGRESS') {
        setError('Вхід вже виконується');
      } else if (e.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
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
    if (Constants.appOwnership === 'expo') return;
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
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

