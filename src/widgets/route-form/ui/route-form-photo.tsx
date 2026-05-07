import * as React from 'react';
import { View, Pressable, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { ImagePlus, Upload, ScanLine, Pencil, X } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';
import { useTranslation } from 'react-i18next';
import type { AnnotationData } from '@/features/route-annotation';

type Props = {
  localPhotoUri: string | null;
  annotationData: AnnotationData | null;
  uploading: boolean;
  isDark: boolean;
  iconColor: string;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
  onOpenAnnotator: () => void;
};

export function RouteFormPhoto({
  localPhotoUri,
  annotationData,
  uploading,
  isDark,
  iconColor,
  onPickPhoto,
  onRemovePhoto,
  onOpenAnnotator,
}: Props) {
  const { t } = useTranslation();
  if (!localPhotoUri) {
    return (
      <Pressable
        onPress={onPickPhoto}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          borderRadius: 16,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          paddingVertical: 32,
        }}>
        <ImagePlus size={22} color={iconColor} />
        <Text className="text-sm font-medium text-muted-foreground">{t('routeForm.pickFromGallery')}</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
      <View style={{ position: 'relative' }}>
        {annotationData ? (
          <View
            style={{
              width: '100%',
              aspectRatio:
                annotationData.canvasHeight > 0
                  ? annotationData.canvasWidth / annotationData.canvasHeight
                  : 4 / 3,
            }}>
            <Image
              source={{ uri: localPhotoUri }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              resizeMode="cover"
            />
            <Svg
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              width="100%"
              height="100%"
              viewBox={`0 0 ${annotationData.canvasWidth} ${annotationData.canvasHeight}`}>
              {annotationData.shapes.map((shape, idx) => {
                if (shape.type === 'circle') {
                  return (
                    <SvgCircle
                      key={shape.id ?? `c-${idx}`}
                      cx={shape.cx}
                      cy={shape.cy}
                      r={shape.r}
                      stroke={shape.color}
                      strokeWidth={2}
                      fill={shape.color + '40'}
                    />
                  );
                }
                return (
                  <SvgPath
                    key={shape.id ?? `p-${idx}`}
                    d={shape.d}
                    stroke={shape.color}
                    strokeWidth={shape.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </Svg>
          </View>
        ) : (
          <Image
            source={{ uri: localPhotoUri }}
            style={{ width: '100%', aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        )}
        {annotationData && annotationData.shapes.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#3b82f6',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <ScanLine size={12} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {t('routeDetail.marksCount', { count: annotationData.shapes.length })}
            </Text>
          </View>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}>
        <View style={{ flex: 1 }}>
          {uploading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={iconColor} />
              <Text className="text-sm text-muted-foreground">{t('routeForm.uploadingPhoto')}</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Upload size={13} color="#22c55e" />
              <Text style={{ color: '#22c55e', fontSize: 13 }}>{t('routeForm.photoUploadedLabel')}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {!uploading && (
            <TouchableOpacity
              onPress={onOpenAnnotator}
              hitSlop={8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: ACCENT + '22',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}>
              <Pencil size={13} color={ACCENT} />
              <Text style={{ color: ACCENT, fontSize: 12, fontWeight: '700' }}>
                {annotationData ? t('routeForm.annotateEdit') : t('routeForm.annotateAdd')}
              </Text>
            </TouchableOpacity>
          )}
          <Pressable onPress={onRemovePhoto} hitSlop={8} style={{ padding: 4 }}>
            <X size={16} color={iconColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

