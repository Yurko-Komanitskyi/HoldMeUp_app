import * as React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Trophy, ChevronDown, Building2, Settings2 } from 'lucide-react-native';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
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
import { useTranslation } from 'react-i18next';

function AppHeader() {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.currentUser);
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);
  const setCurrentGymId = useGymMemberStore((state) => state.setCurrentGymId);
  const router = useRouter();

  const gyms = React.useMemo(() => memberships?.map((m) => m.gym) ?? [], [memberships]);
  const currentGym = React.useMemo(
    () => gyms.find((g) => g.id === currentGymId) ?? gyms[0],
    [gyms, currentGymId]
  );

  const themeColors = useThemeColor();
  const iconColor = themeColors.mutedForeground;
  const foregroundColor = themeColors.foreground;

  const initials =
    (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '') ||
    (user?.email?.charAt(0)?.toUpperCase() ?? '?');

  const gymLabel = currentGym ? currentGym.name : t('common.pickGym');

  return (
    <SafeAreaView edges={['top']} className="z-10 bg-background">
      <View className="px-4" style={{ paddingTop: 14, paddingBottom: 10 }}>
        {user ? (
          <View className="relative flex-row items-center">
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-1 flex-row items-center gap-3">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: ACCENT + '20',
                  borderWidth: 2,
                  borderColor: ACCENT + '50',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: ACCENT, lineHeight: 17 }}>
                  {initials}
                </Text>
              </View>
              <View className="gap-0.5 flex-1">
                <Text className="text-[10px] text-muted-foreground">{t('common.hello')}</Text>
                <Text className="text-base font-extrabold text-foreground" numberOfLines={1}>
                  {user.firstName || t('common.climberDefault')}
                </Text>
              </View>
            </Pressable>

            <View className="ml-4 flex-row items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable
                    className="flex-row items-center gap-1.5 rounded-xl px-3 py-1.5 bg-card/60"
                    style={{ maxWidth: 170 }}>
                    <Icon as={Building2} size={12} color={iconColor} />
                    <Text
                      className="text-xs font-medium text-muted-foreground"
                      style={{ maxWidth: 120 }}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {gymLabel}
                    </Text>
                    {gyms.length > 1 && (
                      <Icon as={ChevronDown} size={11} color={iconColor} />
                    )}
                  </Pressable>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={8} align="end" className="min-w-[180px]">
                  {gyms.length === 0 ? (
                    <DropdownMenuItem onPress={() => router.push('/gym/manage' as never)}>
                      <Icon as={Settings2} size={14} color={ACCENT} />
                      <Text className="text-sm font-medium" style={{ color: ACCENT }}>
                        {t('common.myGyms')}
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
                          {t('common.myGyms')}
                        </Text>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Pressable
                onPress={() => router.push('/achievements' as never)}
                className="h-9 w-9 rounded-xl bg-card/60 items-center justify-center">
                <Icon as={Trophy} size={16} color={foregroundColor} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text variant="large">{t('common.brandName')}</Text>
              <Text variant="muted" className="text-xs">
                {t('common.tagline')}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Link href={'/auth/login' as never} asChild>
                <Button variant="ghost" className="px-3">
                  <Text variant="small">{t('common.login')}</Text>
                </Button>
              </Link>
              <Link href={'/auth/register' as never} asChild>
                <Button className="px-3">
                  <Text variant="small">{t('common.register')}</Text>
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
