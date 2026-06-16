import * as React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Text } from '@/shared/ui/text';
import { ACCENT } from '@/shared/config/palette';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: string;
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterChip({
  label,
  active,
  onPress,
  activeColor = ACCENT,
  isDark,
  style,
}: FilterChipProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, progress]);

  const inactiveBg = isDark ? 'rgba(255,255,255,0.07)' : '#fff';
  const activeBg = activeColor + '22';
  const inactiveBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [inactiveBg, activeBg]),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveBorder, activeColor]
    ),
  }));

  const textColor = active ? activeColor : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.93, { damping: 14, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 8,
        },
        animStyle,
        style,
      ]}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: textColor,
        }}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
