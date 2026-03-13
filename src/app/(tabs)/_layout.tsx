import * as React from 'react';
import { Tabs, Redirect } from 'expo-router';

import { useUserStore } from '@/entities/user/model/userStore';

export default function TabsLayout() {
  const user = useUserStore((state) => state.currentUser);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Головна',
        }}
      />
    </Tabs>
  );
}
