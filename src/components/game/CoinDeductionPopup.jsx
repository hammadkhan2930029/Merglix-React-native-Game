import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text} from 'react-native';
import {
  responsiveFontSize as rf,
  responsiveHeight as hp,
  responsiveWidth as wp,
} from 'react-native-responsive-dimensions';

const coin3d = require('../../assets/coin-3d.png');

export default function CoinDeductionPopup({amount, animationId, onComplete}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!amount) return undefined;
    opacity.setValue(0);
    translateY.setValue(0);
    scale.setValue(0.75);
    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 140, useNativeDriver: true}),
        Animated.delay(650),
        Animated.timing(opacity, {toValue: 0, duration: 260, useNativeDriver: true}),
      ]),
      Animated.timing(translateY, {
        toValue: -hp(7), duration: 1050, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {toValue: 1.12, damping: 8, stiffness: 220, useNativeDriver: true}),
        Animated.timing(scale, {toValue: 1, duration: 180, useNativeDriver: true}),
      ]),
    ]);
    animation.start(({finished}) => {
      if (finished) onComplete?.(animationId);
    });
    return () => animation.stop();
  }, [amount, animationId, onComplete, opacity, scale, translateY]);

  if (!amount) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.popup, {opacity, transform: [{translateY}, {scale}]}]}>
      <Image source={coin3d} resizeMode="contain" style={styles.coin} />
      <Text style={styles.text}>-{amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: hp(12),
    right: wp(8),
    zIndex: 100,
    elevation: 20,
    minWidth: wp(24),
    height: hp(5.6),
    paddingHorizontal: wp(3),
    borderRadius: wp(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(54,20,101,0.95)',
    borderWidth: wp(0.4),
    borderColor: '#FFD94B',
  },
  coin: {width: hp(4.1), height: hp(4.1), marginRight: wp(1.2)},
  text: {color: '#FFD94B', fontSize: rf(2.25), fontWeight: '900'},
});
