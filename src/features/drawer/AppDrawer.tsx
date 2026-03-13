import * as React from 'react';
import { View, Pressable } from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { LogOutIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { setAppLanguage } from '@/shared/lib/i18n';
import { useUserStore } from '@/entities/user/model/userStore';
import { useAuth } from '@/entities/auth/model/useAuth';

type AppDrawerProps = DrawerContentComponentProps;

export function AppDrawer(props: AppDrawerProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const user = useUserStore((state) => state.currentUser);
  const { logout } = useAuth();
  const router = useRouter();

  const isDark = colorScheme === 'dark';

  const initials =
    user?.firstName?.charAt(0) ?? user?.lastName?.charAt(0) ?? user?.email?.charAt(0) ?? 'ЮК';

  async function handleLogout() {
    await logout();
    router.replace('/auth/login');
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1">
        {/* Header */}
        <View className="mb-4 flex-row items-center gap-4 border-b border-border/50 p-6">
          <Avatar alt="User Avatar" className="h-14 w-14 rounded-full bg-muted">
            <AvatarFallback>
              <Text className="text-lg font-semibold text-foreground">{initials}</Text>
            </AvatarFallback>
          </Avatar>

          <View className="flex-1">
            <Text className="text-lg font-bold">{user?.firstName ?? 'Юрко'}</Text>
            <Text className="text-sm text-muted-foreground">
              {user?.email ?? 'yurko@climbcore.app'}
            </Text>
          </View>
        </View>

        {/* Main links (DrawerItemList) */}
        <DrawerItemList {...props} />

        {/* Theme & language switches */}
        <View className="mt-4 gap-4 border-t border-border/50 px-4 pt-4">
          <View className="gap-3">
            <Text variant="small" className="text-muted-foreground">
              Тема
            </Text>
            <Button
              variant="outline"
              className="flex-row items-center justify-between"
              onPress={toggleColorScheme}>
              <View className="flex-row items-center gap-2">
                {isDark ? (
                  <MoonStarIcon size={16} color="#e5e7eb" />
                ) : (
                  <SunIcon size={16} color="#fbbf24" />
                )}
                <Text>{isDark ? 'Темна' : 'Світла'}</Text>
              </View>
              <Text variant="small" className="text-muted-foreground">
                Змінити
              </Text>
            </Button>
          </View>

          <View className="gap-3">
            <Text variant="small" className="text-muted-foreground">
              Мова
            </Text>
            <View className="flex-row gap-2">
              <Button variant="outline" className="flex-1" onPress={() => setAppLanguage('ua')}>
                <Text>Українська</Text>
              </Button>
              <Button variant="ghost" className="flex-1" onPress={() => setAppLanguage('en')}>
                <Text>English</Text>
              </Button>
            </View>
          </View>
        </View>

        {/* Footer (Logout) */}
        <View className="mt-auto border-t border-border/50 p-6 pb-8">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-2 rounded-md bg-destructive/10 px-4 py-3">
            <LogOutIcon size={20} color="#ef4444" />
            <Text className="text-sm font-semibold text-destructive">Вийти з акаунта</Text>
          </Pressable>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}
