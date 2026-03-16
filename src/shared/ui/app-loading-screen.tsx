import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

function MountainIcon() {
  return (
    <Svg width={80} height={64} viewBox="0 0 80 64" fill="none">
      <G opacity={0.9}>
        {/* Задня гора */}
        <Path
          d="M48 8L72 56H24L48 8Z"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        {/* Сніг на задній горі */}
        <Path
          d="M48 8L56 24H40L48 8Z"
          fill="rgba(255,255,255,0.18)"
          strokeWidth={0}
        />
        {/* Передня гора */}
        <Path
          d="M26 20L52 56H0L26 20Z"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Сніг на передній горі */}
        <Path
          d="M26 20L34 36H18L26 20Z"
          fill="rgba(255,255,255,0.28)"
          strokeWidth={0}
        />
        {/* Скелезлаз — крапка на вершині */}
        <Circle cx={26} cy={18} r={3} fill="rgba(255,255,255,0.9)" />
        <Path
          d="M26 15 Q29 10 32 12"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}

function LoadingDots() {
  const dots = [0, 1, 2];

  return (
    <View style={styles.dotsContainer}>
      {dots.map((i) => (
        <PulsingDot key={i} delay={i * 180} />
      ))}
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.25);
  const scale = useSharedValue(0.7);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
          withTiming(0.25, { duration: 500, easing: Easing.in(Easing.ease) })
        ),
        -1
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
          withTiming(0.7, { duration: 500, easing: Easing.in(Easing.ease) })
        ),
        -1
      )
    );
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function IconWrapper() {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MountainIcon />
    </Animated.View>
  );
}

export function AppLoadingScreen() {
  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f0f1a', '#0a0a0f']}
      locations={[0, 0.5, 1]}
      style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <View style={styles.iconContainer}>
          <IconWrapper />
          {/* Тіньове кільце під горою */}
          <View style={styles.shadow} />
        </View>

        <View style={styles.textContainer}>
          <Animated.Text style={styles.title}>HoldMeUp</Animated.Text>
          <Animated.Text style={styles.subtitle}>
            Логи підйомів, батли та статистика
          </Animated.Text>
        </View>

        <LoadingDots />
      </Animated.View>

      {/* Декоративна лінія внизу */}
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomLine}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
  },
  shadow: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginTop: 12,
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  bottomLine: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.5,
    height: 1,
  },
});
