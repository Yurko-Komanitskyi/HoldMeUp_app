import React from 'react';
import { View, Image } from 'react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import type { AnnotationData } from '../model/types';

interface Props {
  photoUrl: string;
  annotationData: AnnotationData;
  displayWidth: number;
}

export function AnnotatedPhoto({ photoUrl, annotationData, displayWidth }: Props) {
  const { canvasWidth, canvasHeight, shapes } = annotationData;

  const baseScale = canvasWidth ? displayWidth / canvasWidth : 1;
  const displayHeight = canvasHeight ? canvasHeight * baseScale : displayWidth;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  function reset() {
    scale.value = withSpring(1, { damping: 20 });
    tx.value = withSpring(0, { damping: 20 });
    ty.value = withSpring(0, { damping: 20 });
    savedScale.value = 1;
    savedTx.value = 0;
    savedTy.value = 0;
  }

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 0.8, 6);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        reset();
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(200)
    .onEnd(() => {
      if (scale.value > 1) {
        reset();
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <View style={{ width: displayWidth, height: displayHeight, overflow: 'hidden' }}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              width: '100%',
              height: '100%',
            },
            animatedStyle,
          ]}>
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            resizeMode="contain"
          />
          <Svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

