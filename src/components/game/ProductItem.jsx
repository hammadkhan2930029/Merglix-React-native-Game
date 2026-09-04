import React, {memo, useEffect, useMemo} from 'react';
import {Image, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SWAP_DURATION = 180;

function clamp(value, minimum, maximum) {
  'worklet';
  return Math.max(minimum, Math.min(maximum, value));
}

function ProductItem({source, index, selected, matching, hint, disabled, slotWidth,
  rowHeight, rows, columns, onTap, onDrop, onInteraction, positionX, positionY,
  activeTarget, notifyMatchComplete, onMatchAnimationComplete}) {
  const visualX = useSharedValue(positionX);
  const visualY = useSharedValue(positionY);
  const dragScale = useSharedValue(1);
  const stateScale = useSharedValue(1);
  const hintScale = useSharedValue(1);
  const hintRotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const row = Math.floor(index / columns);
  const column = index % columns;
  const minimumX = -column * slotWidth;
  const maximumX = (columns - 1 - column) * slotWidth;
  const minimumY = -row * rowHeight;
  const maximumY = (rows - 1 - row) * rowHeight;

  useEffect(() => {
    visualX.value = withTiming(positionX, {duration: SWAP_DURATION, easing: Easing.out(Easing.cubic)});
    visualY.value = withTiming(positionY, {duration: SWAP_DURATION, easing: Easing.out(Easing.cubic)});
  }, [positionX, positionY, visualX, visualY]);

  useEffect(() => {
    stateScale.value = withSpring(selected ? 1.1 : 1, {damping: 14, stiffness: 190});
  }, [selected, stateScale]);

  useEffect(() => {
    if (!matching) {
      opacity.value = 1;
      return;
    }
    stateScale.value = withSequence(
      withTiming(1.18, {duration: 160}),
      withTiming(0, {duration: 240, easing: Easing.in(Easing.cubic)}),
    );
    opacity.value = withDelay(160, withTiming(
      0,
      {duration: 240, easing: Easing.in(Easing.cubic)},
      finished => {
        if (finished && notifyMatchComplete) {
          runOnJS(onMatchAnimationComplete)();
        }
      },
    ));
  }, [matching, notifyMatchComplete, onMatchAnimationComplete, opacity, stateScale]);

  useEffect(() => {
    if (!hint || matching) {
      hintScale.value = withTiming(1, {duration: 100});
      hintRotation.value = withTiming(0, {duration: 100});
      return;
    }
    hintScale.value = withRepeat(withSequence(
      withTiming(1.13, {duration: 170}), withTiming(1, {duration: 170}),
      withTiming(1, {duration: 420}),
    ), -1);
    hintRotation.value = withRepeat(withSequence(
      withTiming(4, {duration: 170}), withTiming(-4, {duration: 170}),
      withTiming(0, {duration: 110}), withTiming(0, {duration: 310}),
    ), -1);
  }, [hint, hintRotation, hintScale, matching]);

  const panGesture = useMemo(() => {
    const calculateTarget = (translationX, translationY) => {
      'worklet';
      const x = clamp(translationX, minimumX, maximumX);
      const y = clamp(translationY, minimumY, maximumY);
      const columnDelta = Math.abs(x) < slotWidth * 0.2 ? 0
        : Math.sign(x) * Math.max(1, Math.round(Math.abs(x) / slotWidth));
      const rowDelta = Math.abs(y) < rowHeight * 0.2 ? 0
        : Math.sign(y) * Math.max(1, Math.round(Math.abs(y) / rowHeight));
      const targetColumn = clamp(column + columnDelta, 0, columns - 1);
      const targetRow = clamp(row + rowDelta, 0, rows - 1);
      return {x, y, target: targetRow * columns + targetColumn,
        targetX: (targetColumn - column) * slotWidth,
        targetY: (targetRow - row) * rowHeight};
    };

    return Gesture.Pan()
      .enabled(!disabled)
      .minDistance(0)
      .shouldCancelWhenOutside(false)
      .onBegin(() => {
        isDragging.value = true;
        dragScale.value = withSpring(1.06, {damping: 16, stiffness: 220});
        activeTarget.value = -1;
      })
      .onUpdate(event => {
        const next = calculateTarget(event.translationX, event.translationY);
        visualX.value = positionX + next.x;
        visualY.value = positionY + next.y;
        activeTarget.value = next.target === index ? -1 : next.target;
      })
      .onEnd(event => {
        const next = calculateTarget(event.translationX, event.translationY);
        const didMove = Math.abs(event.translationX) + Math.abs(event.translationY) > 6;
        activeTarget.value = -1;
        dragScale.value = withSpring(1, {damping: 16, stiffness: 220});
        if (next.target !== index) {
          // Keep the dragged product moving toward the destination itself.
          // When React commits the swap, its new position equals this target,
          // so there is no offset-to-base handoff and therefore no snap-back.
          visualX.value = withTiming(positionX + next.targetX, {
            duration: SWAP_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          visualY.value = withTiming(positionY + next.targetY, {
            duration: SWAP_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          runOnJS(onDrop)(index, next.target);
        } else {
          visualX.value = withSpring(positionX, {damping: 17, stiffness: 230});
          visualY.value = withSpring(positionY, {damping: 17, stiffness: 230});
          if (!didMove) runOnJS(onTap)(index);
        }
        runOnJS(onInteraction)();
      })
      .onFinalize((_event, success) => {
        isDragging.value = false;
        activeTarget.value = -1;
        dragScale.value = withSpring(1, {damping: 16, stiffness: 220});
        if (!success) {
          visualX.value = withSpring(positionX, {damping: 17, stiffness: 230});
          visualY.value = withSpring(positionY, {damping: 17, stiffness: 230});
        }
      });
  }, [activeTarget, column, columns, disabled, dragScale, index, isDragging,
    maximumX, maximumY, minimumX, minimumY, onDrop, onInteraction, onTap,
    positionX, positionY, row, rowHeight, rows, slotWidth, visualX, visualY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: isDragging.value ? 50 : selected ? 10 : 3,
    elevation: isDragging.value ? 14 : 0,
    transform: [
      {translateX: visualX.value},
      {translateY: visualY.value},
      {scale: dragScale.value * stateScale.value * hintScale.value},
      {rotate: `${hintRotation.value}deg`},
    ],
  }));

  return <GestureDetector gesture={panGesture}>
    <Animated.View style={[styles.item, {width: slotWidth, height: rowHeight}, animatedStyle]}>
      <Image source={source} resizeMode="contain" style={styles.image} />
    </Animated.View>
  </GestureDetector>;
}

export default memo(ProductItem);

const styles = StyleSheet.create({
  item: {position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'flex-end'},
  image: {width: '82%', height: '88%'},
});
