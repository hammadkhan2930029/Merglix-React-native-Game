import React, {useEffect, useRef} from 'react';
import {Animated, Image, Modal, Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const coin3d = require('../../assets/coin-3d.png');

export default function LevelCompleteModal({visible, level, score, coins, stars = 3, onNext, onHome}) {
  const {width, height} = useWindowDimensions();
  const overlay = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0.82)).current;
  const starValues = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const scale = Math.min(1.12, Math.max(0.78, Math.min(width / 390, height / 820)));

  useEffect(() => {
    if (!visible) {
      overlay.setValue(0); card.setValue(0.82); starValues.forEach(value => value.setValue(0));
      return undefined;
    }
    const animation = Animated.parallel([
      Animated.timing(overlay, {toValue: 1, duration: 220, useNativeDriver: true}),
      Animated.spring(card, {toValue: 1, friction: 7, tension: 85, useNativeDriver: true}),
      Animated.stagger(100, starValues.map(value => Animated.spring(value, {toValue: 1, friction: 4, tension: 150, useNativeDriver: true}))),
    ]);
    animation.start();
    return () => animation.stop();
  }, [card, overlay, starValues, visible]);

  return (
    <Modal animationType="none" hardwareAccelerated onRequestClose={onHome} statusBarTranslucent transparent visible={visible}>
      <Animated.View style={[styles.overlay, {opacity: overlay}]}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.container, {width: Math.min(width * 0.88, 440), transform: [{scale: card}]}]}>
            <View accessibilityLabel={`${stars} stars`} style={styles.stars}>
              {starValues.map((value, index) => (
                <Animated.View key={index} style={{opacity: value, transform: [{scale: value}, {translateY: index === 1 ? -8 : 3}]}}>
                  <MaterialCommunityIcons color={index < stars ? '#FFD21C' : '#8B754B'} name="star" size={(index === 1 ? 78 : 62) * scale} style={styles.star} />
                </Animated.View>
              ))}
            </View>
            <View style={styles.ribbonWrap}>
              <View style={styles.tailLeft} /><View style={styles.tailRight} />
              <View style={styles.ribbon}><View style={styles.highlight} /><Text style={[styles.title, {fontSize: 27 * scale}]}>LEVEL COMPLETE!</Text></View>
            </View>
            <View style={styles.scoreCard}>
              <Text style={[styles.level, {fontSize: 13 * scale}]}>LEVEL {level}</Text>
              <Text style={[styles.scoreLabel, {fontSize: 22 * scale}]}>Score</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.score, {fontSize: 54 * scale}]}>{score}</Text>
              <View style={styles.divider}><View style={styles.line} /><View style={styles.dot} /><View style={styles.line} /></View>
              <View style={styles.coinRow}><Image source={coin3d} resizeMode="contain" style={{width: 62 * scale, height: 62 * scale}} /><Text style={[styles.coinText, {fontSize: 31 * scale}]}>+{coins}</Text></View>
            </View>
            <GameButton color="#48D119" dark="#179807" label="NEXT" onPress={onNext} scale={scale} />
            <GameButton color="#199DE6" dark="#0870BE" label="HOME" onPress={onHome} scale={scale} />
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

function GameButton({color, dark, label, onPress, scale}) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [styles.buttonDepth, {backgroundColor: dark, height: 65 * scale}, pressed && styles.pressed]}><View style={[styles.button, {backgroundColor: color}]}><View style={styles.buttonHighlight} /><Text style={[styles.buttonText, {fontSize: 27 * scale}]}>{label}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(16,7,22,0.84)'},
  safeArea: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  container: {maxWidth: 440},
  stars: {height: 88, marginBottom: -20, zIndex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  star: {marginHorizontal: -5, textShadowColor: '#FF9D00', textShadowOffset: {width: 0, height: 4}, textShadowRadius: 13},
  ribbonWrap: {zIndex: 4, marginHorizontal: -14, marginBottom: -20},
  ribbon: {height: 82, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: '#7D27BD', borderWidth: 3, borderColor: '#57208B', elevation: 12},
  highlight: {position: 'absolute', top: 3, left: 18, right: 18, height: '43%', borderRadius: 24, backgroundColor: 'rgba(199,103,255,0.42)'},
  tailLeft: {position: 'absolute', left: -8, bottom: -17, width: 75, height: 55, backgroundColor: '#6820A7', transform: [{rotate: '-12deg'}], borderRadius: 8},
  tailRight: {position: 'absolute', right: -8, bottom: -17, width: 75, height: 55, backgroundColor: '#6820A7', transform: [{rotate: '12deg'}], borderRadius: 8},
  title: {color: '#FFF', fontWeight: '900', textAlign: 'center', textShadowColor: '#4B176F', textShadowOffset: {width: 0, height: 3}, textShadowRadius: 2},
  scoreCard: {minHeight: 280, paddingTop: 42, paddingHorizontal: 30, paddingBottom: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 34, backgroundColor: '#FFF0C8', borderWidth: 5, borderColor: '#EFB86D', elevation: 14},
  level: {color: '#9B6A3A', fontWeight: '900', letterSpacing: 1.2},
  scoreLabel: {marginTop: 7, color: '#553090', fontWeight: '800'},
  score: {color: '#553090', fontWeight: '900'},
  divider: {width: '84%', marginVertical: 11, flexDirection: 'row', alignItems: 'center'},
  line: {flex: 1, height: 2, backgroundColor: '#E8B76E'}, dot: {width: 11, height: 11, marginHorizontal: 12, borderRadius: 6, backgroundColor: '#E8B76E'},
  coinRow: {flexDirection: 'row', alignItems: 'center', gap: 18},
  coinText: {color: '#553090', fontWeight: '900'},
  buttonDepth: {marginTop: 16, borderRadius: 30, paddingBottom: 7, elevation: 10},
  button: {flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)'},
  buttonHighlight: {position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.13)'},
  buttonText: {color: '#FFF', fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: {width: 0, height: 3}, textShadowRadius: 2},
  pressed: {opacity: 0.9, transform: [{scale: 0.97}]},
});
