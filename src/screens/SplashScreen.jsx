import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  responsiveWidth as widthPercentageToDP,
  responsiveHeight as heightPercentageToDP,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

const wp = widthPercentageToDP;
const hp = heightPercentageToDP;

const logo = require('../assets/logo.png');
const products = require('../assets/merglix-products.png');
const splashBackground = require('../assets/splasgbg01.png');

export function ProgressBar({animatedProgress, progress}) {
  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      accessible
      accessibilityLabel={`Loading ${progress} percent`}
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: 100, now: progress}}
      style={styles.progressTrack}>
      <Animated.View
        style={[styles.progressFill, {width: fillWidth}]}
      />
    </View>
  );
}

export default function SplashScreen({
  duration = 4000,
  onLoadingComplete = () => {},
}) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const logoEntrance = useRef(new Animated.Value(0)).current;
  const productsEntrance = useRef(new Animated.Value(0)).current;
  const loadingEntrance = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Animated.stagger(180, [logoEntrance, productsEntrance, loadingEntrance].map(value =>
      Animated.spring(value, {toValue: 1, friction: 7, tension: 75, useNativeDriver: true}),
    )).start();

    const listenerId = animatedProgress.addListener(({value}) => {
      setProgress(Math.round(value));
    });

    const animation = Animated.timing(animatedProgress, {
      toValue: 100,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start(({finished}) => {
      if (finished) {
        setProgress(100);
        onLoadingComplete();
      }
    });

    return () => {
      animation.stop();
      animatedProgress.removeListener(listenerId);
    };
  }, [animatedProgress, duration, loadingEntrance, logoEntrance, onLoadingComplete, productsEntrance]);

  return (
    <ImageBackground
      source={splashBackground}
      resizeMode="cover"
      style={styles.screen}>
      <StatusBar hidden />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.hero}>
          <Animated.View style={[styles.logoFrame, {opacity: logoEntrance, transform: [{scale: logoEntrance}]}]}>
            <Image source={logo} resizeMode="contain" style={styles.logo} />
          </Animated.View>

          <Animated.View style={{opacity: productsEntrance, transform: [{translateY: productsEntrance.interpolate({inputRange: [0, 1], outputRange: [35, 0]})}]}}>
            <Image source={products} resizeMode="contain" style={styles.products} />
          </Animated.View>

          <Animated.Text adjustsFontSizeToFit numberOfLines={1} style={[styles.tagline, {opacity: productsEntrance}]}>
            MATCH. MERGE. WIN!
          </Animated.Text>
        </View>

        <Animated.View style={[styles.loadingSection, {opacity: loadingEntrance, transform: [{translateY: loadingEntrance.interpolate({inputRange: [0, 1], outputRange: [18, 0]})}]}]}>
          <ProgressBar
            animatedProgress={animatedProgress}
            progress={progress}
          />
          <Text style={styles.loadingText}>Loading... {progress}%</Text>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const contentWidth = Math.min(wp(84), hp(50));

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(7),
  },
  hero: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(14.5),
  },
  logoFrame: {
    width: contentWidth,
    height: Math.min(hp(17), wp(35)),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  products: {
    width: Math.min(wp(76), hp(44)),
    height: Math.min(hp(23), wp(52)),
    marginTop: hp(1.2),
  },
  tagline: {
    marginTop: hp(1),
    color: '#FFFFFF',
    fontSize: rf(2.15),
    fontWeight: '900',
    letterSpacing: wp(0.12),
    textAlign: 'center',
    textShadowColor: 'rgba(46, 14, 91, 0.55)',
    textShadowOffset: {width: 0, height: hp(0.18)},
    textShadowRadius: wp(0.8),
  },
  loadingSection: {
    width: contentWidth,
    alignItems: 'center',
    paddingBottom: hp(2.8),
  },
  progressTrack: {
    width: '100%',
    height: Math.max(hp(1.45), wp(2.7)),
    padding: wp(0.45),
    borderRadius: wp(5),
    backgroundColor: '#2D1469',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: wp(5),
    backgroundColor: '#FFC335',
    borderTopWidth: hp(0.12),
    borderTopColor: '#FFE47A',
  },
  loadingText: {
    marginTop: hp(1.15),
    color: '#FFFFFF',
    fontSize: rf(1.45),
    fontWeight: '700',
    textAlign: 'center',
  },
});
