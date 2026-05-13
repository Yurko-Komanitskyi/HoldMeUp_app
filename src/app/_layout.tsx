import '@/app/global.css';

import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { LogBox } from 'react-native';
import Constants from 'expo-constants';

import { useUserStore } from '@/entities/user/model/userStore';
import { useAppInterceptors } from '@/shared/hooks/useAppInterceptors';
import { AppHeader } from '@/features/header/ui/header';
import { AppLoadingScreen } from '@/shared/ui/app-loading-screen';
import { AppToastOverlay } from '@/shared/ui/app-toast';
import { AchievementUnlockOverlay } from '@/shared/ui/achievement-unlock-toast';
import { queryClient } from '@/shared/lib/queryClient';
import { NAV_THEME } from '@/shared/lib/theme';
import i18n from '@/shared/lib/i18n';
import { useTranslation } from 'react-i18next';
import { useMyGymMembershipsQuery } from '@/entities/gym-member/model/gymMemberHooks';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'setLayoutAnimationEnabledExperimental is currently a no-op in the New Architecture.',
]);

// ─── AppBootstrap ─────────────────────────────────────────────────────────────

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const [storeHydrated, setStoreHydrated] = React.useState(() =>
    useUserStore.persist.hasHydrated()
  );
  const [ready, setReady] = React.useState(false);

  const user = useUserStore((state) => state.currentUser);
  const userId = user?.id ?? null;

  useAppInterceptors();

  React.useEffect(() => {
    if (storeHydrated) return;
    const unsub = useUserStore.persist.onFinishHydration(() => setStoreHydrated(true));
    if (useUserStore.persist.hasHydrated()) setStoreHydrated(true);
    return unsub;
  }, [storeHydrated]);

  const { isSuccess, isError } = useMyGymMembershipsQuery();

  React.useEffect(() => {
    if (!storeHydrated) return;
    if (!user) {
      setReady(true);
      return;
    }
    if (isSuccess || isError) setReady(true);
    else setReady(false);
  }, [storeHydrated, user, isSuccess, isError]);

  React.useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <AppLoadingScreen />;
  return <>{children}</>;
}

export default function RootLayout() {
  const { t } = useTranslation();
  const theme = useUserStore((state) => state.theme);
  const language = useUserStore((state) => state.language);
  const { setColorScheme } = useColorScheme();

  React.useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);
  React.useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  React.useEffect(() => {
    if (Constants.appOwnership === 'expo') return;

    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch {
      // Native Google Sign-In module is unavailable in Expo Go.
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[theme]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AppBootstrap>
          <Stack screenOptions={{ header: () => <AppHeader /> }}>
            <Stack.Screen name="(tabs)" options={{ title: t('tabs.home') }} />
            <Stack.Screen
              name="auth/login"
              options={{
                title: t('common.login'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/register"
              options={{
                title: t('common.register'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="route/[id]"
              options={{
                title: t('drawer.route'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="route/edit/[id]"
              options={{
                title: t('drawer.routeEdit'),
                header: () => null,
              }}
            />
            <Stack.Screen
              name="ascent/[routeId]"
              options={{
                title: t('drawer.ascent'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ascent-detail/[id]"
              options={{
                title: t('ascentDetail.title'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="gym/join"
              options={{
                title: t('gym.findGym'),
                header: () => null,
              }}
            />
            <Stack.Screen
              name="gym/manage"
              options={{
                title: t('gym.manageTitle'),
                header: () => null,
              }}
            />
            <Stack.Screen
              name="gym/[id]"
              options={{
                title: t('gym.detailTitle'),
                header: () => null,
              }}
            />
            <Stack.Screen
              name="ascents/ascents"
              options={{
                title: t('ascents.title'),
                header: () => null,
              }}
            />
            <Stack.Screen
              name="user/[userId]"
              options={{
                title: t('drawer.userProfile'),
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="leaderboard"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="achievements"
              options={{ headerShown: false }}
            />
          </Stack>
        </AppBootstrap>
        <PortalHost />
        <AppToastOverlay />
        <AchievementUnlockOverlay isDark={theme === 'dark'} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
