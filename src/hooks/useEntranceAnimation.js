import {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

export default function useEntranceAnimation(delay = 0, distance = 18) {
  const progress = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      progress.setValue(0);
      return undefined;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, isFocused, progress]);

  return {
    opacity: progress,
    transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [distance, 0]})}],
  };
}
