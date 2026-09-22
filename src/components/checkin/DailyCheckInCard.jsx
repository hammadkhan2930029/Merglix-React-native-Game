import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, AppState, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  responsiveWidth as wp,
  responsiveHeight as hp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import {useGameProgress} from '../../context/GameProgressContext';
import {
  CHECK_IN_REWARDS,
  GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE,
  getCheckInStatus,
  getDisplayedCheckInDayIndex,
  getLocalDateKey,
  normalizeCheckIn,
} from '../../game/checkIn';
import useGameSounds from '../../hooks/useGameSounds';

const coin3d = require('../../assets/coin-3d.png');

export default function DailyCheckInCard() {
  const {claimDailyCheckIn, dailyCheckIn} = useGameProgress();
  const playSound = useGameSounds();
  const [dateKey, setDateKey] = useState(getLocalDateKey);
  const [claiming, setClaiming] = useState(false);
  const claimLock = useRef(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;
  const success = useRef(new Animated.Value(0)).current;
  const checkIn = useMemo(() => normalizeCheckIn(dailyCheckIn), [dailyCheckIn]);
  const status = getCheckInStatus(checkIn, dateKey);
  const dayIndex = getDisplayedCheckInDayIndex(checkIn, status);
  const reward = CHECK_IN_REWARDS[dayIndex];

  useEffect(() => {
    const refreshDate = () => setDateKey(getLocalDateKey());
    const interval = setInterval(refreshDate, 60000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refreshDate();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (status !== 'available') {
      pulse.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, {toValue: 1.025, duration: 850, useNativeDriver: true}),
      Animated.timing(pulse, {toValue: 1, duration: 850, useNativeDriver: true}),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse, status]);

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(float, {toValue: -hp(0.7), duration: 1100, useNativeDriver: true}),
      Animated.timing(float, {toValue: 0, duration: 1100, useNativeDriver: true}),
    ]));
    animation.start();
    return () => animation.stop();
  }, [float]);

  const claim = () => {
    if (claimLock.current || status !== 'available') return;
    claimLock.current = true;
    setClaiming(true);
    claimDailyCheckIn(dateKey);
    playSound('coins');
    success.setValue(0);
    Animated.sequence([
      Animated.spring(success, {toValue: 1, friction: 4, useNativeDriver: true}),
      Animated.delay(450),
      Animated.timing(success, {toValue: 0, duration: 220, useNativeDriver: true}),
    ]).start(() => {
      claimLock.current = false;
      setClaiming(false);
    });
  };

  if (status === 'locked') {
    const gate = checkIn.gameplayCoinsSinceCycle;
    const percent = Math.min(100, (gate / GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE) * 100);
    return (
      <View style={styles.lockDepth}>
        <View style={styles.lockCard}>
          <View style={styles.lockIcon}><MaterialCommunityIcons color="#FFE06A" name="lock" size={rf(4)} /></View>
          <Text style={styles.lockEyebrow}>NEXT CHECK-IN CYCLE</Text>
          <Text style={styles.lockTitle}>Earn 100 Gameplay Coins</Text>
          <Text style={styles.lockHint}>Only match and level-completion coins count</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, {width: `${percent}%`}]} /></View>
          <Text style={styles.progressText}>{gate} / {GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE}</Text>
        </View>
      </View>
    );
  }

  const claimed = status === 'claimed';
  const waiting = status === 'waiting';
  const daySeven = dayIndex === 6;
  const buttonLabel = waiting
    ? 'AVAILABLE TOMORROW'
    : claimed
      ? 'COME BACK TOMORROW'
      : daySeven
        ? 'CLAIM GRAND REWARD'
        : 'CLAIM';

  return (
    <Animated.View style={[styles.cardDepth, daySeven && styles.grandDepth, {transform: [{scale: pulse}]}]}>
      <View style={[styles.card, claimed && styles.claimedCard, waiting && styles.waitingCard, daySeven && !claimed && styles.grandCard]}>
        <View pointerEvents="none" style={styles.cardHighlight} />
        <Text style={styles.eyebrow}>{daySeven ? 'GRAND DAILY REWARD' : 'DAILY CHECK-IN'}</Text>
        <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>DAY {dayIndex + 1} OF 7</Text></View>
        <Animated.View style={{transform: [{translateY: float}]}}>
          <Image source={coin3d} resizeMode="contain" style={styles.coin} />
        </Animated.View>
        <Text style={styles.rewardAmount}>+{reward}</Text>
        <Text style={styles.rewardLabel}>COINS</Text>
        <Text style={styles.stateText}>
          {waiting
            ? `Cycle ${checkIn.cycle} unlocked`
            : claimed
              ? `Day ${dayIndex + 1} completed`
              : `Cycle ${checkIn.cycle} reward is ready`}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={claimed || waiting || claiming}
          onPress={claim}
          style={({pressed}) => [styles.buttonDepth, (claimed || waiting) && styles.disabledDepth, pressed && styles.pressed]}>
          <View style={[styles.button, (claimed || waiting) && styles.disabledButton]}>
            <MaterialCommunityIcons color="#FFFFFF" name={claimed ? 'check-circle' : waiting ? 'clock-outline' : 'gift'} size={rf(2.25)} />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </View>
        </Pressable>
        <Animated.View pointerEvents="none" style={[styles.success, {opacity: success, transform: [{scale: success}]}]}>
          <MaterialCommunityIcons color="#FFFFFF" name="check-bold" size={rf(3.2)} />
          <Text style={styles.successText}>+{reward} COINS!</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardDepth: {paddingBottom: hp(1), borderRadius: wp(7), backgroundColor: '#4E177C', elevation: 10},
  grandDepth: {backgroundColor: '#A95A00'},
  card: {minHeight: hp(49), padding: wp(5), overflow: 'hidden', alignItems: 'center', borderRadius: wp(7), backgroundColor: '#7B37BA', borderWidth: wp(0.7), borderColor: '#B978E7'},
  cardHighlight: {position: 'absolute', top: 0, left: wp(3), right: wp(3), height: '34%', borderRadius: wp(7), backgroundColor: 'rgba(255,255,255,0.08)'},
  claimedCard: {backgroundColor: '#4B9D46', borderColor: '#8CD77E'},
  waitingCard: {backgroundColor: '#68557D', borderColor: '#9886AA'},
  grandCard: {backgroundColor: '#9A4AC0', borderColor: '#FFD257'},
  eyebrow: {color: '#FFE05A', fontSize: rf(2.2), fontWeight: '900', letterSpacing: wp(0.25)},
  dayBadge: {marginTop: hp(1.1), paddingHorizontal: wp(4), paddingVertical: hp(0.65), borderRadius: wp(5), backgroundColor: '#43166F'},
  dayBadgeText: {color: '#FFF', fontSize: rf(1.4), fontWeight: '900'},
  coin: {width: Math.min(wp(31), hp(17)), height: Math.min(wp(31), hp(17)), marginTop: hp(1.4)},
  rewardAmount: {marginTop: -hp(1.2), color: '#FFD83D', fontSize: rf(5.2), fontWeight: '900', textShadowColor: '#5C2800', textShadowOffset: {width: 0, height: hp(0.3)}, textShadowRadius: wp(0.7)},
  rewardLabel: {color: '#FFF7D3', fontSize: rf(1.7), fontWeight: '900', letterSpacing: wp(0.5)},
  stateText: {marginTop: hp(1.1), color: '#F2E7FA', fontSize: rf(1.35), fontWeight: '700'},
  buttonDepth: {width: '88%', height: hp(6.6), marginTop: hp(2.1), paddingBottom: hp(0.7), borderRadius: wp(7), backgroundColor: '#157F10', elevation: 8},
  button: {flex: 1, gap: wp(2), borderRadius: wp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#48CF25', borderWidth: wp(0.5), borderColor: '#94F06E'},
  buttonText: {color: '#FFF', fontSize: rf(1.85), fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 1},
  disabledDepth: {backgroundColor: '#51475D'},
  disabledButton: {backgroundColor: '#81748E', borderColor: '#A89EB0'},
  pressed: {opacity: 0.88, transform: [{scale: 0.97}]},
  success: {position: 'absolute', top: '43%', paddingHorizontal: wp(5), paddingVertical: hp(1.4), gap: wp(2), borderRadius: wp(6), flexDirection: 'row', alignItems: 'center', backgroundColor: '#42BE24', borderWidth: wp(0.5), borderColor: '#B7FF8E', elevation: 14},
  successText: {color: '#FFF', fontSize: rf(2), fontWeight: '900'},
  lockDepth: {paddingBottom: hp(1), borderRadius: wp(7), backgroundColor: '#3B2850', elevation: 9},
  lockCard: {minHeight: hp(42), padding: wp(6), alignItems: 'center', justifyContent: 'center', borderRadius: wp(7), backgroundColor: '#68557C', borderWidth: wp(0.7), borderColor: '#927BA7'},
  lockIcon: {width: wp(19), height: wp(19), maxWidth: 92, maxHeight: 92, borderRadius: wp(10), alignItems: 'center', justifyContent: 'center', backgroundColor: '#432B59', borderWidth: wp(0.6), borderColor: '#9B83AC'},
  lockEyebrow: {marginTop: hp(2), color: '#FFE05A', fontSize: rf(1.55), fontWeight: '900'},
  lockTitle: {marginTop: hp(0.7), color: '#FFF', fontSize: rf(2.5), fontWeight: '900', textAlign: 'center'},
  lockHint: {marginTop: hp(0.8), color: '#DED1E8', fontSize: rf(1.25), textAlign: 'center'},
  progressTrack: {width: '90%', height: hp(2), marginTop: hp(3), overflow: 'hidden', borderRadius: wp(4), backgroundColor: '#352344', borderWidth: wp(0.35), borderColor: '#8D79A0'},
  progressFill: {height: '100%', borderRadius: wp(4), backgroundColor: '#FFD132'},
  progressText: {marginTop: hp(1), color: '#FFF', fontSize: rf(1.75), fontWeight: '900'},
});
