import React from 'react';
import { View, Image, Modal, Pressable, StatusBar, useWindowDimensions } from 'react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { AnnotationData } from '../model/types';

interface Props {
  photoUrl: string;
  annotationData: AnnotationData;
  displayWidth: number;
}

export function AnnotatedPhoto({ photoUrl, annotationData, displayWidth }: Props) {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [open, setOpen] = React.useState(false);
  const { canvasWidth, canvasHeight, shapes } = annotationData;

  const baseScale = canvasWidth ? displayWidth / canvasWidth : 1;
  const displayHeight = canvasHeight ? canvasHeight * baseScale : displayWidth;

  const maxModalHeight = Math.max(220, screenHeight - 140);
  const screenFitScale = canvasWidth ? screenWidth / canvasWidth : 1;
  const rawModalHeight = canvasHeight * screenFitScale;
  const modalScale =
    rawModalHeight > maxModalHeight ? maxModalHeight / canvasHeight : screenFitScale;
  const modalWidth = Math.min(screenWidth, canvasWidth * modalScale);
  const modalHeight = canvasHeight * modalScale;

  const preview = (
    <View style={{ width: displayWidth, height: displayHeight, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Image
          source={{ uri: photoUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="contain"
        />
      </View>
      <Svg style={{ width: '100%', height: '100%', position: 'absolute' }} pointerEvents="none">
        {shapes.map((shape) => {
          if (shape.type === 'circle') {
            return (
              <SvgCircle
                key={shape.id}
                cx={shape.cx * baseScale}
                cy={shape.cy * baseScale}
                r={shape.r * baseScale}
                stroke={shape.color}
                strokeWidth={3 * baseScale}
                fill={shape.color + '40'}
              />
            );
          }
          if (shape.type === 'path') {
            return (
              <SvgPath
                key={shape.id}
                d={shape.d}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`scale(${baseScale})`}
              />
            );
          }
          return null;
        })}
      </Svg>
    </View>
  );

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>{preview}</Pressable>
      <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
        <StatusBar hidden />
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => {
              setOpen(false);
            }}
            style={{
              position: 'absolute',
              top: 52,
              right: 16,
              zIndex: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <X size={22} color="#fff" />
          </Pressable>

          <ResumableZoom
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            maxScale={6}>
            <View style={{ width: modalWidth, height: modalHeight }}>
              <View
                pointerEvents="none"
                style={{ position: 'absolute', width: '100%', height: '100%' }}>
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                  resizeMode="contain"
                />
              </View>
              <Svg
                style={{ width: '100%', height: '100%', position: 'absolute' }}
                pointerEvents="none">
                {shapes.map((shape) => {
                  if (shape.type === 'circle') {
                    return (
                      <SvgCircle
                        key={shape.id}
                        cx={shape.cx * modalScale}
                        cy={shape.cy * modalScale}
                        r={shape.r * modalScale}
                        stroke={shape.color}
                        strokeWidth={3 * modalScale}
                        fill={shape.color + '40'}
                      />
                    );
                  }
                  if (shape.type === 'path') {
                    return (
                      <SvgPath
                        key={shape.id}
                        d={shape.d}
                        stroke={shape.color}
                        strokeWidth={shape.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        transform={`scale(${modalScale})`}
                      />
                    );
                  }
                  return null;
                })}
              </Svg>
            </View>
          </ResumableZoom>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
