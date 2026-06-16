import { ACCENT } from '@/shared/config/palette';
import { Plus } from 'lucide-react-native';
import { Pressable, View, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface FABProps {
  onPress: () => void;
  tabBarBg: string;
}

export function GrabitButton({ onPress, tabBarBg }: FABProps) {
  const size = 58;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.shadowContainer, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.88, { damping: 14, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 8, stiffness: 180 });
        }}
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
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
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
});
