import React, {useEffect, useRef} from 'react';
import {
  ImageBackground,
  Image,
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  responsiveWidth as widthPercentageToDP,
  responsiveHeight as heightPercentageToDP,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import {LEVEL_CONFIGS} from '../game/levelConfigs';

const wp = widthPercentageToDP;
const hp = heightPercentageToDP;

const logo = require('../assets/logo.png');
const background = require('../assets/menu-background.png');
const coin3d = require('../assets/coin-3d.png');

export default function MainMenuScreen({
  onPlay = () => {},
  onDailyReward = () => {},
  onCoinShop = () => {},
  onSettings = () => {},
}) {
  const {coins, level} = useGameProgress();
  const levelLabel = LEVEL_CONFIGS[level] ? `LEVEL ${level}` : 'COMING SOON';
  const entranceStyle = useEntranceAnimation();
  const logoFloat = useRef(new Animated.Value(0)).current;
  const playPulse = useRef(new Animated.Value(1)).current;
  const rewardBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {toValue: 1, duration: 1500, useNativeDriver: true}),
        Animated.timing(logoFloat, {toValue: 0, duration: 1500, useNativeDriver: true}),
      ]),
    );
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(playPulse, {toValue: 1.035, duration: 850, useNativeDriver: true}),
        Animated.timing(playPulse, {toValue: 1, duration: 850, useNativeDriver: true}),
      ]),
    );
    const bouncing = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.spring(rewardBounce, {toValue: -5, friction: 4, useNativeDriver: true}),
        Animated.spring(rewardBounce, {toValue: 0, friction: 4, useNativeDriver: true}),
      ]),
    );
    floating.start(); pulsing.start(); bouncing.start();
    return () => { floating.stop(); pulsing.stop(); bouncing.stop(); };
  }, [logoFloat, playPulse, rewardBounce]);

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.screen}>
      <StatusBar hidden />
      <View pointerEvents="none" style={styles.readabilityOverlay} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.animatedContent, entranceStyle]}>
        <View style={styles.topBar}>
          <View style={styles.topRightControls}>
            <Pressable
              accessibilityLabel={`${coins} coins. Open coin shop`}
              accessibilityRole="button"
              onPress={onCoinShop}
              style={({pressed}) => [styles.coinPill, pressed && styles.pressed]}>
              <Image source={coin3d} resizeMode="contain" style={styles.coinImage} />
              <Text numberOfLines={1} style={styles.coinText}>{coins}</Text>
              <MaterialCommunityIcons color="#52DF36" name="plus-circle" size={17} />
            </Pressable>
            <Pressable
              accessibilityLabel="Settings"
              accessibilityRole="button"
              onPress={onSettings}
              style={({pressed}) => [
                styles.settingsButton,
                pressed && styles.pressed,
              ]}>
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="cog"
                size={rf(2.7)}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.menuContent}>
          <Animated.Image source={logo} resizeMode="contain" style={[styles.logo, {transform: [{translateY: logoFloat.interpolate({inputRange: [0, 1], outputRange: [0, -7]})}]}]} />

          <View style={styles.levelBadge}>
            <Text numberOfLines={1} style={styles.levelText}>{levelLabel}</Text>
          </View>

          <Animated.View style={{transform: [{scale: playPulse}]}}>
          <Pressable
            accessibilityRole="button"
            onPress={onPlay}
            style={({pressed}) => [
              styles.playButtonShadow,
              pressed && styles.buttonPressed,
            ]}>
            <View style={styles.playButton}>
              <View pointerEvents="none" style={styles.playHighlight} />
              <Text style={styles.playText}>PLAY</Text>
            </View>
          </Pressable>
          </Animated.View>

          <Animated.View style={{transform: [{translateY: rewardBounce}]}}>
          <Pressable
            accessibilityRole="button"
            onPress={onDailyReward}
            style={({pressed}) => [
              styles.rewardButton,
              pressed && styles.buttonPressed,
            ]}>
            <MaterialCommunityIcons
              color="#FFD238"
              name="gift"
              size={rf(2.7)}
              style={styles.giftIcon}
            />
            <Text style={styles.rewardText}>REWARDS</Text>
          </Pressable>
          </Animated.View>
        </View>

        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const maxContentWidth = Math.min(wp(90), hp(53));

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6C56F',
  },
  readabilityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 244, 205, 0.08)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  animatedContent: {flex: 1, width: '100%', alignItems: 'center'},
  topBar: {
    width: maxContentWidth,
    minHeight: hp(7),
    paddingTop: hp(1.2),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  coinPill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5,
    borderRadius: 17, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#2D155B', elevation: 4},
  coinText: {maxWidth: 46, color: '#FFF', fontSize: 12, fontWeight: '900'},
  coinImage: {width: 28, height: 28},
  settingsButton: {
    width: Math.min(wp(11), hp(5.5)),
    aspectRatio: 1,
    borderRadius: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B3ED0',
    borderWidth: wp(0.5),
    borderColor: '#D49BFF',
    elevation: 5,
  },
  menuContent: {
    flex: 1,
    width: maxContentWidth,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(5),
  },
  logo: {
    width: Math.min(wp(88), hp(51)),
    height: Math.min(hp(16), wp(36)),
  },
  levelBadge: {
    marginTop: hp(3.7),
    paddingHorizontal: wp(7),
    height: Math.min(hp(5.2), wp(11)),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7140B7',
    borderWidth: wp(0.3),
    borderColor: '#925CE0',
    shadowColor: '#41206C',
    shadowOffset: {width: 0, height: hp(0.35)},
    shadowOpacity: 0.45,
    shadowRadius: wp(0.7),
    elevation: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: rf(1.75),
    fontWeight: '900',
  },
  playButtonShadow: {
    width: Math.min(wp(59), hp(35)),
    height: Math.min(hp(10.5), wp(22)),
    marginTop: hp(2.7),
    borderRadius: wp(12),
    backgroundColor: '#168F18',
    paddingBottom: hp(0.65),
    elevation: 8,
  },
  playButton: {
    flex: 1,
    borderRadius: wp(12),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FC82A',
    borderWidth: wp(0.45),
    borderColor: '#248E18',
  },
  playHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(145, 235, 76, 0.52)',
  },
  playText: {
    color: '#FFFFFF',
    fontSize: rf(4),
    fontWeight: '900',
    textShadowColor: '#217B18',
    textShadowOffset: {width: 0, height: hp(0.35)},
    textShadowRadius: wp(0.6),
  },
  rewardButton: {
    minWidth: Math.min(wp(59), hp(35)),
    height: Math.min(hp(7.2), wp(15)),
    marginTop: hp(2.8),
    paddingHorizontal: wp(4),
    borderRadius: wp(9),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1685D2',
    borderWidth: wp(0.4),
    borderColor: '#075B9F',
    shadowColor: '#07477C',
    shadowOffset: {width: 0, height: hp(0.5)},
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 6,
  },
  giftIcon: {
    marginRight: wp(2),
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: rf(1.75),
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{scale: 0.97}],
  },
});
