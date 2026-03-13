import * as React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellIcon } from 'lucide-react-native';
import { Link } from 'expo-router';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { useUserStore } from '@/entities/user/model/userStore';

function AppHeader() {
  const user = useUserStore((state) => state.currentUser);

  const initials =
    user?.firstName?.charAt(0) ?? user?.lastName?.charAt(0) ?? user?.email?.charAt(0) ?? 'Ю';

  return (
    <>
      <SafeAreaView edges={['top']} className="z-10 bg-background">
        <View className="border-b border-border/60 px-4 pb-3 pt-2">
          {user ? (
            <View className="flex-row items-center justify-between">
              <Pressable className="flex-row items-center gap-3">
                <Avatar alt="User Avatar" className="h-10 w-10 rounded-full bg-muted">
                  <AvatarFallback>
                    <Text className="text-xs font-semibold text-foreground">{initials}</Text>
                  </AvatarFallback>
                </Avatar>
                <View className="gap-0.5">
                  <Text variant="small" className="text-muted-foreground">
                    Привіт, {user.firstName ?? 'скелелазе'} 🧗‍♂️
                  </Text>
                  <Text variant="muted" className="text-xs text-muted-foreground">
                    HoldMeUp
                  </Text>
                </View>
              </Pressable>
              <View className="flex-row items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full border border-border/60 bg-card/60">
                  <Icon as={BellIcon} className="text-foreground" />
                </Button>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <View>
                <Text variant="large">HoldMeUp</Text>
                <Text variant="muted" className="text-xs">
                  Логи підйомів, батли та статистика
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Link href={'/auth/login' as any} asChild>
                  <Button variant="ghost" className="px-3">
                    <Text variant="small">Увійти</Text>
                  </Button>
                </Link>
                <Link href={'/auth/register' as any} asChild>
                  <Button className="px-3">
                    <Text variant="small">Реєстрація</Text>
                  </Button>
                </Link>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

export { AppHeader };
