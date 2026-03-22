import * as React from 'react';
import { View } from 'react-native';
import { Info } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';

type Props = {
  tags: string[];
};

export function RouteDetailTags({ tags }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  if (!tags || tags.length === 0) return null;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Info size={13} color={sectionTitleColor} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: sectionTitleColor,
            textTransform: 'uppercase',
            letterSpacing: 0.7,
          }}>
          {t('routeDetail.tags')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {tags.map((tag) => (
          <View
            key={tag}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.18)',
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(255,255,255,0.1)',
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isDark ? 'rgba(248,250,252,0.92)' : 'rgba(15,23,42,0.9)',
              }}>
              # {tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

