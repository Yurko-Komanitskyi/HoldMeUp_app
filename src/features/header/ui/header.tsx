import * as React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Bell, ChevronDown, RefreshCw, Building2, Settings2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { ACCENT } from '@/shared/config/palette';
import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { useGymMembersQuery } from '@/entities/gym-member/model/gymMemberHooks';

function AppHeader() {
  const user = useUserStore((state) => state.currentUser);
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);
  const setCurrentGymId = useGymMemberStore((state) => state.setCurrentGymId);
  const router = useRouter();

  const { isLoading, isError, refetch } = useGymMembersQuery(currentGymId ?? '');

  const gyms = React.useMemo(() => memberships?.map((m) => m.gym) ?? [], [memberships]);
  const currentGym = React.useMemo(
    () => gyms.find((g) => g.id === currentGymId) ?? gyms[0],
    [gyms, currentGymId]
  );

  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const foregroundColor = colorScheme === 'dark' ? '#ffffff' : '#000000';

  const initials =
    user?.firstName?.charAt(0) ?? user?.lastName?.charAt(0) ?? user?.email?.charAt(0) ?? '?';

  const gymLabel = isLoading
    ? '...'
    : isError
      ? 'Помилка'
      : currentGym
        ? currentGym.name
        : 'Оберіть зал';

  return (
    <SafeAreaView edges={['top']} className="z-10 bg-background">
      <View className="border-b border-border/60 px-4 pb-3 pt-2">
        {user ? (
          <View className="relative flex-row items-center justify-between">
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-row items-center gap-3">
              <Avatar alt="User Avatar" className="h-10 w-10 rounded-2xl bg-accent/15">
                <AvatarFallback className="rounded-2xl">
                  <Text className="text-sm font-bold text-accent">{initials}</Text>
                </AvatarFallback>
              </Avatar>
              <View className="gap-0.5">
                <Text className="text-xs text-muted-foreground">Привіт</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {user.firstName ?? 'Скелеліз'}
                </Text>
              </View>
            </Pressable>

            <View className="flex-row items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable
                    className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                      isError
                        ? 'border-destructive/40 bg-destructive/10'
                        : 'border-border/60 bg-card/60'
                    }`}>
                    {isLoading ? (
                      <ActivityIndicator size={12} color={iconColor} />
                    ) : (
                      <Icon
                        as={isError ? RefreshCw : Building2}
                        size={12}
                        color={isError ? '#ef4444' : iconColor}
                      />
                    )}
                    <Text
                      className={`text-xs font-medium ${isError ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {gymLabel}
                    </Text>
                    {!isLoading && !isError && gyms.length > 1 && (
                      <Icon as={ChevronDown} size={11} color={iconColor} />
                    )}
                  </Pressable>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={8} align="end" className="min-w-[180px]">
                  {isError ? (
                    <Pressable
                      onPress={() => refetch()}
                      className="flex-row items-center gap-2 px-3 py-3">
                      <Icon as={RefreshCw} size={13} color="#ef4444" />
                      <Text className="text-sm text-destructive">Повторити</Text>
                    </Pressable>
                  ) : isLoading ? (
                    <View className="items-center py-3">
                      <ActivityIndicator size="small" />
                    </View>
                  ) : gyms.length === 0 ? (
                    <DropdownMenuItem onPress={() => router.push('/gym/manage' as never)}>
                      <Icon as={Settings2} size={14} color={ACCENT} />
                      <Text className="text-sm font-medium" style={{ color: ACCENT }}>
                        Керувати залами
                      </Text>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuRadioGroup
                        value={currentGym?.id}
                        onValueChange={(value) => setCurrentGymId(value)}>
                        {gyms.map((gym) => (
                          <DropdownMenuRadioItem key={gym.id} value={gym.id}>
                            <Text className="text-sm">{gym.name}</Text>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onPress={() => router.push('/gym/manage' as never)}>
                        <Icon as={Settings2} size={14} color={ACCENT} />
                        <Text className="text-sm" style={{ color: ACCENT }}>
                          Керувати залами
                        </Text>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl border border-border/60 bg-card/60">
                <Icon as={Bell} size={16} color={foregroundColor} />
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="large">HoldMeUp</Text>
              <Text variant="muted" className="text-xs">
                Логи підйомів та статистика
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Link href={'/auth/login' as never} asChild>
                <Button variant="ghost" className="px-3">
                  <Text variant="small">Увійти</Text>
                </Button>
              </Link>
              <Link href={'/auth/register' as never} asChild>
                <Button className="px-3">
                  <Text variant="small">Реєстрація</Text>
                </Button>
              </Link>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export { AppHeader };
