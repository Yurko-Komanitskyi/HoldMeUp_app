import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

export default function Screen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}>
      <View className="gap-8 px-4 pb-20 pt-8">
        {/* Auth actions */}
        <View className="flex-row gap-3">
          <Link href={'/auth/login' as any} asChild>
            <Button className="flex-1">
              <Text>Увійти</Text>
            </Button>
          </Link>
          <Link href={'/auth/register' as any} asChild>
            <Button variant="outline" className="flex-1">
              <Text>Зареєструватися</Text>
            </Button>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
