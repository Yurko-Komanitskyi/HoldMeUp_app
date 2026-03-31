import { ACCENT } from '@/shared/config/palette';
import { Plus } from 'lucide-react-native';
import { Pressable, View, Platform, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { Text } from '@/shared/ui/text';

interface FABProps {
  onPress: () => void;
  tabBarBg: string;
}

export function GrabitButton({ onPress, tabBarBg }: FABProps) {
  const size = 58;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 12,
    }).start();

  const isDark = tabBarBg !== '#ffffff';

  return (
    <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', radius: size / 2 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ACCENT,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: tabBarBg,
          overflow: 'hidden',
        }}>
        <View style={styles.gloss} />
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    alignItems: 'center',
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
        shadowColor: ACCENT,
      },
    }),
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
