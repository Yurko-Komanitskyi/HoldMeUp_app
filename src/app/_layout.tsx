import '@/app/global.css';

import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { PortalHost } from '@rn-primitives/portal';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useUserStore } from '@/entities/user/model/userStore';
import { useAppInterceptors } from '@/app/model/useAppInterceptors';
import { AppHeader } from '@/features/header/ui/header';
import { AppLoadingScreen } from '@/shared/ui/app-loading-screen';
import { AppToastOverlay } from '@/shared/ui/app-toast';
import { queryClient } from '@/shared/lib/queryClient';
import { NAV_THEME } from '@/shared/lib/theme';
import i18n from '@/shared/lib/i18n';
import { useTranslation } from 'react-i18next';
import { useMyGymMembershipsQuery } from '@/entities/gym-member/model/gymMemberHooks';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

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
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[theme]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AppBootstrap>
          <Drawer screenOptions={{ header: () => <AppHeader /> }}>
            <Drawer.Screen name="(tabs)" options={{ title: t('tabs.home') }} />
            <Drawer.Screen
              name="auth/login"
              options={{
                title: t('common.login'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="auth/register"
              options={{
                title: t('common.register'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="route/[id]"
              options={{
                title: t('drawer.route'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="route/edit/[id]"
              options={{
                title: t('drawer.routeEdit'),
                drawerItemStyle: { display: 'none' },
                header: () => null,
              }}
            />
            <Drawer.Screen
              name="ascent/[routeId]"
              options={{
                title: t('drawer.ascent'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="ascent-detail/[id]"
              options={{
                title: t('ascentDetail.title'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="gym/join"
              options={{
                title: t('gym.findGym'),
                drawerItemStyle: { display: 'none' },
                header: () => null,
              }}
            />
            <Drawer.Screen
              name="gym/manage"
              options={{
                title: t('gym.manageTitle'),
                drawerItemStyle: { display: 'none' },
                header: () => null,
              }}
            />
            <Drawer.Screen
              name="ascents/ascents"
              options={{
                title: t('ascents.title'),
                drawerItemStyle: { display: 'none' },
                header: () => null,
              }}
            />
            <Drawer.Screen
              name="user/[userId]"
              options={{
                title: t('drawer.userProfile'),
                drawerItemStyle: { display: 'none' },
                headerShown: false,
              }}
            />
          </Drawer>
        </AppBootstrap>
        <PortalHost />
        <AppToastOverlay />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
