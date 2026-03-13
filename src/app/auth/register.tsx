import * as React from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center">
      <Stack.Screen options={{ title: 'Реєстрація', headerShown: false }} />
      <View className="flex-1 bg-background px-4 pt-12">
        <View className="mb-8 gap-3">
          <Text variant="h1">Реєстрація</Text>
          <Text variant="muted">
            Створи акаунт HoldMeUp, щоб зберігати свої підйоми, проєкти та батли.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text variant="small" className="text-muted-foreground">
              Імʼя
            </Text>
            <Input placeholder="Імʼя" />
          </View>
          <View className="gap-2">
            <Text variant="small" className="text-muted-foreground">
              Email
            </Text>
            <Input placeholder="you@example.com" keyboardType="email-address" />
          </View>
          <View className="gap-2">
            <Text variant="small" className="text-muted-foreground">
              Пароль
            </Text>
            <Input placeholder="********" secureTextEntry />
          </View>

          <Button className="mt-2" onPress={() => router.replace('/auth/login')}>
            <Text>Створити акаунт</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
