import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Image, Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {responsiveWidth as wp, responsiveHeight as hp, responsiveFontSize as rf} from 'react-native-responsive-dimensions';
import {useGameProgress} from '../context/GameProgressContext';
import {ADS_PER_REWARD, HOURLY_REWARD_COINS, getCooldownRemaining, getHourlyRewardStatus, normalizeHourlyAdReward} from '../game/hourlyAdRewards';
import useGameSounds from '../hooks/useGameSounds';
import useRewardedCoinsAd from '../hooks/useRewardedCoinsAd';

const coin3d = require('../assets/coin-3d.png');

function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function RewardsScreen() {
  const {coins, completeHourlyRewardAd, hourlyAdReward, setRewardedAdShowing} = useGameProgress();
  const playSound = useGameSounds();
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState('Watch all 5 ads to unlock 100 coins.');
  const entrance = useRef(new Animated.Value(0)).current;
  const rewardState = useMemo(() => normalizeHourlyAdReward(hourlyAdReward, now), [hourlyAdReward, now]);
  const onCooldown = getHourlyRewardStatus(rewardState, now) === 'cooldown';
  const remaining = getCooldownRemaining(rewardState, now);

  const handleEarned = useCallback(() => {
    const nextCount = Math.min(ADS_PER_REWARD, rewardState.adsWatched + 1);
    completeHourlyRewardAd(Date.now());
    if (nextCount === ADS_PER_REWARD) {
      playSound('coins');
      setMessage(`Reward unlocked! +${HOURLY_REWARD_COINS} coins added.`);
    } else {
      setMessage(`Ad completed! ${ADS_PER_REWARD - nextCount} more to unlock the reward.`);
    }
  }, [completeHourlyRewardAd, playSound, rewardState.adsWatched]);

  const rewardedAd = useRewardedCoinsAd(handleEarned, setRewardedAdShowing);
  const rewardedAdStatus = rewardedAd.status;
  const retryRewardedAd = rewardedAd.retry;

  useEffect(() => {
    Animated.spring(entrance, {toValue: 1, friction: 8, tension: 65, useNativeDriver: true}).start();
  }, [entrance]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (rewardedAdStatus === 'closed') setMessage('Ad was closed early. Only fully watched ads count.');
    if (rewardedAdStatus === 'earnedClosed') retryRewardedAd();
  }, [retryRewardedAd, rewardedAdStatus]);

  const watchAd = () => {
    if (onCooldown) return;
    if (rewardedAd.status === 'error') {
      setMessage('Reloading the ad. Please try again.');
      rewardedAd.retry();
      return;
    }
    if (rewardedAd.status !== 'ready') return;
    setMessage('Watch the complete ad so it counts toward your reward.');
    rewardedAd.show();
  };

  const busy = ['loading', 'showing', 'earned', 'earnedClosed'].includes(rewardedAd.status);
  const disabled = onCooldown || busy;
  const buttonLabel = onCooldown ? `READY IN ${formatRemaining(remaining)}`
    : rewardedAd.status === 'ready' ? 'WATCH AD'
      : rewardedAd.status === 'error' ? 'RETRY AD'
        : rewardedAd.status === 'showing' ? 'PLAYING...' : 'LOADING AD...';

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="#6C28B3" barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><MaterialCommunityIcons color="#FFD23E" name="gift" size={rf(2.8)} /></View>
          <Text style={styles.headerTitle}>REWARDS</Text>
          <View style={styles.balancePill}>
            <Image source={coin3d} resizeMode="contain" style={styles.balanceCoin} />
            <Text numberOfLines={1} style={styles.balanceText}>{coins}</Text>
            <MaterialCommunityIcons color="#55DC3C" name="plus-circle" size={17} />
          </View>
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.content, {opacity: entrance, transform: [{translateY: entrance.interpolate({inputRange: [0, 1], outputRange: [hp(4), 0]})}]}]}>
        <View style={styles.cardDepth}>
          <View style={styles.card}>
            <View style={styles.glow} />
            <Text style={styles.eyebrow}>HOURLY BONUS</Text>
            <Text style={styles.title}>WATCH & EARN</Text>
            <View style={styles.coinHalo}><Image source={coin3d} resizeMode="contain" style={styles.heroCoin} /></View>
            <View style={styles.amountRow}>
              <Text style={styles.plus}>+</Text><Text style={styles.amount}>{HOURLY_REWARD_COINS}</Text><Text style={styles.coinsLabel}>COINS</Text>
            </View>
            {onCooldown ? (
              <Text style={styles.instruction}>Reward collected! Your next round unlocks in:</Text>
            ) : null}

            {!onCooldown ? (
              <View style={styles.progressRow}>
                {Array.from({length: ADS_PER_REWARD}, (_, index) => {
                  const completed = index < rewardState.adsWatched;
                  return (
                    <View key={index} style={styles.stepWrap}>
                      <View style={[styles.adStep, completed && styles.adStepComplete]}>
                        <MaterialCommunityIcons color={completed ? '#FFFFFF' : '#6C2BA4'} name={completed ? 'check-bold' : 'play'} size={rf(2.3)} />
                      </View>
                      <Text style={[styles.stepText, completed && styles.stepTextComplete]}>{index + 1}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.messagePill}>
              <MaterialCommunityIcons color="#FFD33A" name="information" size={rf(1.9)} />
              <Text style={styles.message}>{message}</Text>
            </View>
            <Pressable accessibilityLabel={buttonLabel} accessibilityRole="button" disabled={disabled} onPress={watchAd}
              style={({pressed}) => [styles.buttonDepth, disabled && styles.disabled, pressed && styles.pressed]}>
              <View style={[styles.button, onCooldown && styles.cooldownButton]}>
                <MaterialCommunityIcons color="#FFFFFF" name={onCooldown ? 'timer-sand' : 'play-circle'} size={rf(2.7)} />
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <Text style={styles.footer}>Only completed ads count • Reward resets after 1 hour</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFE8B5'},
  headerSafe: {backgroundColor: '#6C28B3'},
  header: {height: hp(7), paddingHorizontal: wp(4), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: wp(0.8), borderBottomColor: '#481383'},
  headerIcon: {width: wp(10), height: wp(10), maxWidth: 48, maxHeight: 48, borderRadius: wp(5), alignItems: 'center', justifyContent: 'center', backgroundColor: '#813FC5'},
  headerTitle: {position: 'absolute', left: wp(25), right: wp(25), color: '#FFF', fontSize: rf(2.4), fontWeight: '900', textAlign: 'center'},
  balancePill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D155B'},
  balanceCoin: {width: 28, height: 28},
  balanceText: {maxWidth: 46, color: '#FFF', fontSize: 12, fontWeight: '900'},
  content: {flex: 1, width: wp(91), maxWidth: 560, alignSelf: 'center', justifyContent: 'center', paddingBottom: hp(10)},
  cardDepth: {paddingBottom: hp(0.9), borderRadius: wp(7), backgroundColor: '#48157A', elevation: 12},
  card: {minHeight: hp(62), paddingHorizontal: wp(5), paddingVertical: hp(2.6), overflow: 'hidden', alignItems: 'center', borderRadius: wp(7), backgroundColor: '#7935B9', borderWidth: wp(0.65), borderColor: '#B96AEA'},
  glow: {position: 'absolute', top: -wp(28), width: wp(80), height: wp(80), borderRadius: wp(40), backgroundColor: 'rgba(255,210,53,0.13)'},
  eyebrow: {color: '#FFD83D', fontSize: rf(1.45), fontWeight: '900', letterSpacing: wp(0.35)},
  title: {marginTop: hp(0.35), color: '#FFFFFF', fontSize: rf(3.1), fontWeight: '900', textShadowColor: '#401160', textShadowOffset: {width: 0, height: hp(0.25)}, textShadowRadius: wp(0.5)},
  coinHalo: {width: Math.min(wp(37), hp(18)), aspectRatio: 1, marginTop: hp(1.5), borderRadius: wp(20), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,212,54,0.17)', borderWidth: wp(0.5), borderColor: 'rgba(255,230,104,0.42)'},
  heroCoin: {width: '88%', height: '88%'},
  amountRow: {marginTop: hp(0.5), flexDirection: 'row', alignItems: 'baseline'},
  plus: {color: '#FFD83D', fontSize: rf(3), fontWeight: '900'},
  amount: {color: '#FFD83D', fontSize: rf(5.3), fontWeight: '900', textShadowColor: '#552100', textShadowOffset: {width: 0, height: hp(0.25)}, textShadowRadius: wp(0.5)},
  coinsLabel: {marginLeft: wp(2), color: '#FFF1C4', fontSize: rf(1.55), fontWeight: '900'},
  instruction: {width: '94%', marginTop: hp(1), color: '#F5E9FF', fontSize: rf(1.45), fontWeight: '800', lineHeight: rf(2), textAlign: 'center'},
  progressRow: {width: '100%', marginTop: hp(2), flexDirection: 'row', justifyContent: 'space-between'},
  stepWrap: {alignItems: 'center'},
  adStep: {width: Math.min(wp(13), hp(6.5)), aspectRatio: 1, borderRadius: wp(3), alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5E5FF', borderWidth: wp(0.5), borderColor: '#D3A7E9', elevation: 4},
  adStepComplete: {backgroundColor: '#59C92E', borderColor: '#B9F182'},
  stepText: {marginTop: hp(0.45), color: '#D8BDEA', fontSize: rf(1.15), fontWeight: '900'},
  stepTextComplete: {color: '#FFD83D'},
  messagePill: {width: '100%', minHeight: hp(6.2), marginTop: hp(1.8), paddingHorizontal: wp(3), paddingVertical: hp(0.8), gap: wp(2), borderRadius: wp(4), flexDirection: 'row', alignItems: 'center', backgroundColor: '#4B1B7B'},
  message: {flex: 1, color: '#FFF7D7', fontSize: rf(1.6), lineHeight: rf(2.15), fontWeight: '800', textAlign: 'center'},
  buttonDepth: {width: '100%', height: hp(7.2), marginTop: hp(1.8), paddingBottom: hp(0.65), borderRadius: wp(9), backgroundColor: '#197E12', elevation: 9},
  button: {flex: 1, gap: wp(2), borderRadius: wp(9), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#55CE28', borderWidth: wp(0.45), borderColor: '#A8F06E'},
  cooldownButton: {backgroundColor: '#5E4B75', borderColor: '#9279AA'},
  buttonText: {color: '#FFFFFF', fontSize: rf(2.15), fontWeight: '900', textShadowColor: '#265916', textShadowOffset: {width: 0, height: hp(0.2)}, textShadowRadius: wp(0.35)},
  disabled: {opacity: 0.7},
  pressed: {opacity: 0.88, transform: [{scale: 0.98}]},
  footer: {marginTop: hp(1.6), paddingHorizontal: wp(2), color: '#542277', fontSize: rf(1.5), lineHeight: rf(2), fontWeight: '900', textAlign: 'center'},
});
