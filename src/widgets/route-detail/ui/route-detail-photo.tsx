import * as React from 'react';
import { View } from 'react-native';
import { Image as ImageIcon, ScanLine } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/shared/ui/text';
import { useTranslation } from 'react-i18next';
import { ZoomableImage } from '@/features/route-annotation/ui/zoomable-image';
import { AnnotatedPhoto } from '@/features/route-annotation';
import type { AnnotationData } from '@/features/route-annotation';

type Props = {
  photoUrl?: string | null;
  parsedAnnotation: AnnotationData | null;
  displayWidth: number;
};

export function RouteDetailPhoto({ photoUrl, parsedAnnotation, displayWidth }: Props) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  if (!photoUrl) return null;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ImageIcon size={14} color={sectionTitleColor} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: isDark ? '#e0e0e8' : '#1a1a2a',
            }}>
            {t('routeDetail.photoTitle')}
          </Text>
        </View>
        {parsedAnnotation && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: '#3b82f622',
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: 8,
            }}>
            <ScanLine size={11} color="#3b82f6" />
            <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '600' }}>
              {t('routeDetail.marksCount', { count: parsedAnnotation.shapes.length })}
            </Text>
          </View>
        )}
      </View>
      {parsedAnnotation ? (
        <AnnotatedPhoto
          photoUrl={photoUrl}
          annotationData={parsedAnnotation}
          displayWidth={displayWidth}
        />
      ) : (
        <ZoomableImage
          uri={photoUrl}
          width={displayWidth}
          height={displayWidth * 0.65}
        />
      )}
    </View>
  );
}

