import * as React from 'react';
import { View, Animated, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mountain, MapPin, Route, BarChart2, ArrowRight, Zap } from 'lucide-react-native';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Icon as UiIcon } from '@/shared/ui/icon';
import type { LucideIcon } from 'lucide-react-native';

function FeatureItem({
  icon: IconComponent,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Card className="border-border bg-card">
        <CardContent className="flex-row items-center gap-3 px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl">
            <UiIcon as={IconComponent} size={17} strokeWidth={2} className="text-accent" />
          </View>
          <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
          <ArrowRight size={14} color="#52525b" strokeWidth={2} />
        </CardContent>
      </Card>
    </Pressable>
  );
}

export function HomeUnlogin() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <View className="flex-1 justify-between pb-8 pt-4">
        <View className="w-full items-center gap-4">
          <View className="items-center gap-2 py-10">
            <View className="flex-row items-center gap-2 rounded-full bg-accent/10 px-3 py-1">
                <UiIcon as={Zap} size={14} strokeWidth={2} className="text-accent" />
              <Text className="text-xs font-medium text-accent">Твій трекер прогресу в залі</Text>
            </View>
            <Text className="text-center text-xl font-bold text-foreground">
              Тримай свій прогрес під контролем
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Всі маршрути, спроби та статистика в одному місці.
            </Text>
          </View>

          <View className="w-full gap-2">
            <FeatureItem
              icon={MapPin}
              label="Відстежуй прогрес по секторах"
              onPress={() => router.push('/auth/login')}
            />
            <FeatureItem
              icon={Route}
              label="Нові накрутки та оновлення маршрутів"
              onPress={() => router.push('/auth/login')}
            />
            <FeatureItem
              icon={BarChart2}
              label="Статистика, рекорди і динаміка росту"
              onPress={() => router.push('/auth/login')}
            />
          </View>
        </View>

        <View className="w-full gap-3">
          <Separator className="bg-border" />

          <Button
            size="lg"
            className="w-full active:opacity-90"
            onPress={() => router.push('/auth/register')}>
            <Text className="text-sm font-bold text-primary-foreground">Почати безкоштовно</Text>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full active:opacity-80"
            onPress={() => router.push('/auth/login')}>
            <Text className="text-sm font-medium text-foreground">Вже маю акаунт</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
