import * as React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Plus, Route, User, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';

import { useUserStore } from '@/entities/user/model/userStore';
import { useGymMemberStore } from '@/entities/gym-member/model/gymMemberStore';
import { ACCENT } from '@/shared/config/palette';
import { THEME } from '@/shared/config/tokens';
import { useTranslation } from 'react-i18next';
import { GymMemberRole } from '@/entities/gym-member/model/gym-member';
import { RoutePickerModal } from '@/features/route-picker/ui/route-picker-modal';
import { GrabitButton } from './fab-button';
import { useHomeDashboard } from '@/features/home-dashboard/model/useHomeDashboard';
import type { Route as ClimbRoute } from '@/entities/route/model/route';

export default function TabsLayout() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useUserStore((state) => state.currentUser);
  const theme = useUserStore((state) => state.theme);
  const memberships = useGymMemberStore((state) => state.memberships);
  const currentGymId = useGymMemberStore((state) => state.currentGymId);

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const { routes } = useHomeDashboard();

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

  const handleRouteSelect = React.useCallback(
    (route: ClimbRoute) => {
      setPickerVisible(false);
      router.push(`/ascent/${route.id}` as never);
    },
    [router]
  );

  const inactiveColor = theme === 'dark' ? THEME.dark.mutedForeground : THEME.light.mutedForeground;
  const bottomInset = insets.bottom ?? 0;
  const tabBarBg = theme === 'dark' ? THEME.dark.card : THEME.light.card;
  const tabBarBorder = theme === 'dark' ? THEME.dark.border : THEME.light.border;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACCENT,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: tabBarBg,
            borderTopColor: tabBarBorder,
            borderTopWidth: 1,
            height: 60 + bottomInset,
            paddingBottom: bottomInset > 0 ? bottomInset : 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
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
            href: user ? '/(tabs)' : null,
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
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
          name="log-ascent"
          options={{
            title: '',
            tabBarButton: () => (user ? <View style={{ flex: 1, maxWidth: 60 }} /> : null),
          }}
        />

        <Tabs.Screen
          name="community"
          options={{
            title: t('tabs.community'),
            href: user ? '/community' : null,
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="add-route"
          options={{
            title: t('tabs.addRoute'),
            href: user && (isSetter || isManager) ? '/add-route' : null,
            tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
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

        <Tabs.Screen name="gym-stats" options={{ href: null }} />
      </Tabs>
      <View
        style={{
          display: user ? 'flex' : 'none',
          position: 'absolute',
          alignSelf: 'center',
          left: isManager || isSetter ? 138 : 'auto',
          bottom: 40 + bottomInset - 26,
          zIndex: 10,
        }}
        pointerEvents="box-none">
        <GrabitButton onPress={() => setPickerVisible(true)} tabBarBg={tabBarBg} />
      </View>
      <RoutePickerModal
        visible={pickerVisible}
        routes={routes}
        onClose={() => setPickerVisible(false)}
        onSelect={handleRouteSelect}
      />
    </View>
  );
}
