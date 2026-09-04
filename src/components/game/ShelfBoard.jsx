import React, {memo, useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {PRODUCT_ASSETS} from '../../game/levelConfigs';
import ProductItem from './ProductItem';

const shelfImage = require('../../assets/cupboard with 3 shelf.png');

function ShelfBoard({board, rows, columns, boardSize, selectedIndex, matchingIndices,
  disabled, onTap, onDrop, onInteraction, hintIndices,
  onMatchAnimationComplete}) {
  const activeTarget = useSharedValue(-1);
  const geometry = useMemo(() => {
    const horizontalInset = boardSize * 0.065;
    const topInset = boardSize * 0.035;
    return {
      horizontalInset,
      topInset,
      slotWidth: (boardSize - horizontalInset * 2) / columns,
      rowHeight: (boardSize * 0.9) / rows,
    };
  }, [boardSize, columns, rows]);

  const targetStyle = useAnimatedStyle(() => {
    const target = activeTarget.value;
    const targetColumn = target < 0 ? 0 : target % columns;
    const targetRow = target < 0 ? 0 : Math.floor(target / columns);
    return {
      opacity: target < 0 ? 0 : 1,
      transform: [
        {translateX: geometry.horizontalInset + targetColumn * geometry.slotWidth},
        {translateY: geometry.topInset + targetRow * geometry.rowHeight},
      ],
    };
  });
  const matchCompletionIndex = matchingIndices.size > 0
    ? Math.min(...matchingIndices)
    : -1;

  return <View style={[styles.board, {width: boardSize, height: boardSize}]}>
    <Image source={shelfImage} resizeMode="stretch" style={styles.shelf} />
    <Animated.View pointerEvents="none" style={[styles.dropTarget,
      {width: geometry.slotWidth, height: geometry.rowHeight}, targetStyle]} />
    {board.map((item, index) => {
      if (!item) return null;
      const row = Math.floor(index / columns);
      const column = index % columns;
      return <ProductItem
        key={item.id}
        activeTarget={activeTarget}
        disabled={disabled}
        index={index}
        matching={matchingIndices.has(index)}
        notifyMatchComplete={index === matchCompletionIndex}
        onMatchAnimationComplete={onMatchAnimationComplete}
        hint={hintIndices.has(index)}
        onDrop={onDrop}
        onInteraction={onInteraction}
        columns={columns}
        rows={rows}
        onTap={onTap}
        rowHeight={geometry.rowHeight}
        positionX={geometry.horizontalInset + column * geometry.slotWidth}
        positionY={geometry.topInset + row * geometry.rowHeight}
        selected={selectedIndex === index}
        slotWidth={geometry.slotWidth}
        source={PRODUCT_ASSETS[item.type]}
      />;
    })}
  </View>;
}

export default memo(ShelfBoard);

const styles = StyleSheet.create({
  board: {position: 'relative', overflow: 'hidden'},
  shelf: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%'},
  dropTarget: {position: 'absolute', left: 0, top: 0, zIndex: 2,
    borderRadius: 12, borderWidth: 3, borderColor: '#FFD83D',
    backgroundColor: 'rgba(255,216,61,0.2)'},
});
