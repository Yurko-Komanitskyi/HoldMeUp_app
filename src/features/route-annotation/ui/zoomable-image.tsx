import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View, StatusBar } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  uri: string;
  width: number;
  height: number;
  borderRadius?: number;
};

export function ZoomableImage({ uri, width, height, borderRadius = 0 }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

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
        scale.value = withSpring(1);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
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
        scale.value = withSpring(1);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
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
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ width, height, borderRadius, overflow: 'hidden' }}>
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
        <StatusBar hidden />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => {
              reset();
              setOpen(false);
            }}
            style={{
              position: 'absolute',
              top: 52,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <X size={22} color="#fff" />
          </Pressable>

          <GestureDetector gesture={gesture}>
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <Animated.View
                style={[
                  { flex: 1, alignItems: 'center', justifyContent: 'center' },
                  animatedStyle,
                ]}>
                <Image
                  source={{ uri }}
                  style={{ width: '100%', aspectRatio: 1 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </GestureDetector>
        </View>
      </Modal>
    </>
  );
}

