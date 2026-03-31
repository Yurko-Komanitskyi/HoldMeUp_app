import * as React from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { AscentsWidget } from '@/widgets/ascents/ui/ascents-widget';
import { Text } from '@/shared/ui/text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export default function AscentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          paddingBottom: 10,
          minHeight: 44,
        }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ChevronLeft size={28} color={colors.foreground} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: '700',
            color: colors.foreground,
            textAlign: 'center',
            marginRight: 44,
          }}
          numberOfLines={1}>
          {t('ascents.title')}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <AscentsWidget />
      </View>
    </SafeAreaView>
  );
}
