import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import type { SwipeDirection } from 'react-native-zoom-toolkit';
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
  const close = () => setOpen(false);

  function handleSwipe(direction: SwipeDirection) {
    if (direction === 'right' || direction === 'down') {
      close();
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ width, height, borderRadius, overflow: 'hidden' }}>
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}>
        <StatusBar hidden />
        <GestureHandlerRootView style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={close}
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

          <ResumableZoom
            maxScale={6}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onSwipe={handleSwipe}>
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </ResumableZoom>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
