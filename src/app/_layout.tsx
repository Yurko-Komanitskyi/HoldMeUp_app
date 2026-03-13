import '@/app/global.css';

import { NAV_THEME } from '@/shared/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

import { AppHeader } from '@/features/header/Header';
import { AppDrawer } from '@/features/drawer/AppDrawer';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Drawer
        screenOptions={{
          header: () => <AppHeader />,
        }}
        drawerContent={(props) => <AppDrawer {...props} />}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Головна',
          }}
        />
      </Drawer>
      <PortalHost />
    </ThemeProvider>
  );
}
