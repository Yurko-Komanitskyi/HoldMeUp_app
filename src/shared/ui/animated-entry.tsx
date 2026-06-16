import * as React from 'react';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { type ViewProps } from 'react-native';

interface AnimatedEntryProps extends ViewProps {
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'fade';
  children: React.ReactNode;
}

export function AnimatedEntry({
  delay = 0,
  duration = 400,
  direction = 'up',
  children,
  style,
  ...props
}: AnimatedEntryProps) {
  const entering = React.useMemo(() => {
    if (direction === 'fade') {
      return FadeIn.delay(delay).duration(duration);
    }
    const base = direction === 'up' ? FadeInDown : FadeInUp;
    return base
      .delay(delay)
      .duration(duration)
      .springify()
      .damping(18)
      .stiffness(130);
  }, [delay, duration, direction]);

  return (
    <Animated.View entering={entering} style={style} {...props}>
      {children}
    </Animated.View>
  );
}
