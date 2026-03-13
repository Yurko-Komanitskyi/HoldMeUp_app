import * as React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { Input } from '@/shared/ui/input';
import { useAuth } from '@/entities/auth/model/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/');
    } catch (e: any) {
      const message = e?.message ?? 'Не вдалося увійти. Спробуйте ще раз.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Stack.Screen options={{ title: 'Увійти', headerShown: false }} />
      <View className="flex-1 bg-background px-4 pt-12">
        <View className="mb-8 gap-3">
          <Text variant="h1">Увійти</Text>
          <Text variant="muted">
            Уведи email та пароль, щоб продовжити відстежувати свої підйоми в HoldMeUp.
          </Text>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text variant="small" className="text-muted-foreground">
              Email
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
          </View>

          <View className="gap-2">
            <Text variant="small" className="text-muted-foreground">
              Пароль
            </Text>
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="********"
            />
          </View>

          {error && (
            <Text variant="muted" className="text-xs text-destructive">
              {error}
            </Text>
          )}

          <Button onPress={handleSubmit} disabled={loading} className="mt-2">
            <Text>{loading ? 'Вхід...' : 'Увійти'}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
