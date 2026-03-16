import * as React from 'react';
import { Tabs } from 'expo-router';
import { BarChart2, Home, Mountain, PlusCircle, Route, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';

const ACCENT = 'rgb(139, 153, 200)';
const INACTIVE = 'rgba(255,255,255,0.3)';
const INACTIVE_LIGHT = 'rgba(0,0,0,0.3)';

export default function TabsLayout() {
  const navigation = useNavigation();
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

  const inactiveColor = theme === 'dark' ? INACTIVE : INACTIVE_LIGHT;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0a0a0f' : '#ffffff',
          borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
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
          title: 'Головна',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ascents"
        options={{
          title: 'Пролази',
          tabBarIcon: ({ color, size }) => <Mountain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Маршрути',
          tabBarIcon: ({ color, size }) => <Route size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gym-stats"
        options={{
          title: 'Статистика',
          href: isManager ? '/gym-stats' : null,
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-route"
        options={{
          title: 'Додати',
          href: isSetter || isManager ? '/add-route' : null,
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профіль',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
