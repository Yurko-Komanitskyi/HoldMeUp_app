import * as React from 'react';
import { Tabs } from 'expo-router';
import { BarChart2, Home, Mountain, PlusCircle, Route, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import { ACCENT } from '@/shared/config/palette';
import { THEME } from '@/shared/config/tokens';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.currentUser);
  const theme = useUserStore((state) => state.theme);
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);

  React.useEffect(() => {
    if (!user) {
      navigation.navigate('auth/login' as never);
    } else if (memberships.length === 0 && !currentGymId) {
      navigation.navigate('gym/join' as never);
    }
  }, [user?.id, memberships.length, currentGymId, navigation]);

  const myMembership = memberships.find((m) => m.gym.id === currentGymId);
  const isManager =
    myMembership &&
    (myMembership.role === GymMemberRole.MANAGER || myMembership.role === GymMemberRole.OWNER);
  const isSetter = myMembership?.role === GymMemberRole.SETTER;

  const inactiveColor = theme === 'dark' ? THEME.dark.mutedForeground : THEME.light.mutedForeground;

  const baseTabHeight = Platform.OS === 'ios' ? 60 : 60;
  const bottomInset = insets.bottom ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? THEME.dark.card : THEME.light.card,
          borderTopColor: theme === 'dark' ? THEME.dark.border : THEME.light.border,
          borderTopWidth: 1,
          height: baseTabHeight + bottomInset,
          paddingBottom: bottomInset > 0 ? bottomInset : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ascents"
        options={{
          title: t('tabs.ascents'),
          href: user ? '/ascents' : null,
          tabBarIcon: ({ color, size }) => <Mountain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: t('tabs.routes'),
          href: user ? '/routes' : null,
          tabBarIcon: ({ color, size }) => <Route size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gym-stats"
        options={{
          title: t('tabs.gymStats'),
          href: user && (isManager || isSetter) ? '/gym-stats' : null,
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-route"
        options={{
          title: t('tabs.addRoute'),
          href: user && (isSetter || isManager) ? '/add-route' : null,
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          href: user ? '/profile' : null,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
