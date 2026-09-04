import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import ShelfBoard from '../components/game/ShelfBoard';
import LevelCompleteModal from '../components/game/LevelCompleteModal';
import {createLevelBoard, detectMatches, findHintSwap, swapSlots} from '../game/boardLogic';
import {LEVEL_CONFIGS} from '../game/levelConfigs';
import useGameSounds from '../hooks/useGameSounds';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';

const background = require('../assets/menu-background.png');
const timerClock = require('../assets/timer-clock-3d.png');
const config = LEVEL_CONFIGS[1];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function GameplayScreen({navigation, route}) {
  const {width, height} = useWindowDimensions();
  const playSound = useGameSounds();
  const {addCoins, saveLevelStars} = useGameProgress();
  const level = route?.params?.level ?? 1;
  const entranceStyle = useEntranceAnimation(50, 18);
  const timeoutRef = useRef(null);
  const hintTimerRef = useRef(null);
  const matchResolutionRef = useRef(null);
  const completedRef = useRef(false);
  const [board, setBoard] = useState(() => createLevelBoard(config));
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [matchingIndices, setMatchingIndices] = useState(new Set());
  const [inputLocked, setInputLocked] = useState(false);
  const [matchCoins, setMatchCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds);
  const [paused, setPaused] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [complete, setComplete] = useState(false);
  const [coinFeedback, setCoinFeedback] = useState(null);
  const [hintIndices, setHintIndices] = useState(new Set());
  const [activityVersion, setActivityVersion] = useState(0);

  const boardSize = Math.min(width * 0.94, height * 0.59, 620);

  const restartLevel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    completedRef.current = false;
    setBoard(createLevelBoard(config));
    setSelectedIndex(null);
    setMatchingIndices(new Set());
    setInputLocked(false);
    setMatchCoins(0);
    setTimeLeft(config.durationSeconds);
    setPaused(false);
    setTimeUp(false);
    setComplete(false);
    setCoinFeedback(null);
    setHintIndices(new Set());
    matchResolutionRef.current = null;
  }, []);

  useEffect(() => {
    if (paused || complete || timeUp || inputLocked) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeft(current => {
        if (current <= 1) {
          setTimeUp(true);
          setInputLocked(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [complete, inputLocked, paused, timeUp]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (paused || complete || timeUp || inputLocked) return undefined;
    hintTimerRef.current = setTimeout(() => {
      const hint = findHintSwap(board, config.rows, config.columns, config.matchSize);
      setHintIndices(new Set(hint ?? []));
    }, 5500);
    return () => clearTimeout(hintTimerRef.current);
  }, [activityVersion, board, complete, inputLocked, paused, timeUp]);

  const registerActivity = useCallback(() => {
    setHintIndices(new Set());
    setActivityVersion(current => current + 1);
  }, []);

  const finishMatchAnimation = useCallback(() => {
    const resolution = matchResolutionRef.current;
    if (!resolution) return;
    matchResolutionRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const cleared = resolution.board.map((item, index) =>
      resolution.indices.has(index) ? null : item,
    );
    const isComplete = cleared.every(item => item === null);
    playSound('match');
    setBoard(cleared);
    setMatchingIndices(new Set());
    setCoinFeedback(null);

    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      const earnedStars = timeLeft >= 100 ? 3 : timeLeft >= 50 ? 2 : 1;
      saveLevelStars(level, earnedStars);
      setComplete(true);
      playSound('complete');
    } else {
      setInputLocked(false);
    }
  }, [level, playSound, saveLevelStars, timeLeft]);

  const resolveMatches = useCallback(
    nextBoard => {
      const groups = detectMatches(
        nextBoard,
        config.rows,
        config.columns,
        config.matchSize,
      );

      if (groups.length === 0) {
        setInputLocked(false);
        return;
      }

      const indices = new Set(groups.flat());
      const reward = groups.length * config.matchReward;
      setInputLocked(true);
      setHintIndices(new Set());
      setSelectedIndex(null);
      setMatchingIndices(indices);
      setMatchCoins(current => current + reward);
      addCoins(reward);
      setCoinFeedback(`+${reward}`);
      matchResolutionRef.current = {board: nextBoard, indices};
      // Safety fallback only. Normally ProductItem calls completion from the
      // actual UI-thread disappear animation at exactly 400ms.
      timeoutRef.current = setTimeout(finishMatchAnimation, 650);
    },
    [addCoins, finishMatchAnimation],
  );

  const moveProduct = useCallback(
    (fromIndex, toIndex) => {
      if (inputLocked || paused || timeUp || complete || !board[fromIndex]) {
        return;
      }
      const nextBoard = swapSlots(board, fromIndex, toIndex);
      if (nextBoard === board) {
        return;
      }
      setInputLocked(true);
      setBoard(nextBoard);
      setSelectedIndex(null);
      timeoutRef.current = setTimeout(() => {
        playSound('move');
        resolveMatches(nextBoard);
      }, 180);
    },
    [board, complete, inputLocked, paused, playSound, resolveMatches, timeUp],
  );

  const handleTap = useCallback(
    index => {
      if (inputLocked || paused || timeUp || complete) {
        return;
      }
      registerActivity();
      if (selectedIndex === null) {
        setSelectedIndex(index);
      } else if (selectedIndex === index) {
        setSelectedIndex(null);
      } else {
        moveProduct(selectedIndex, index);
      }
    },
    [complete, inputLocked, moveProduct, paused, registerActivity, selectedIndex, timeUp],
  );

  const handleDrop = useCallback(
    (fromIndex, targetIndex) => moveProduct(fromIndex, targetIndex),
    [moveProduct],
  );

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.screen}>
      <View style={styles.tint} />
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.gameContent, entranceStyle]}>
        <View style={styles.gameHeader}>
          <View pointerEvents="none" style={styles.headerHighlight} />
          <View style={styles.headerLevelPill}>
            <Text style={styles.headerLevelText}>Level {level}</Text>
          </View>
          <View style={styles.headerTimer}>
            <Image source={timerClock} resizeMode="contain" style={styles.timerClock} />
            <Text style={styles.headerTimerText}>{formatTime(timeLeft)}</Text>
          </View>
          <Pressable onPress={() => setPaused(true)} style={styles.pauseButton}>
            <MaterialCommunityIcons color="#FFFFFF" name="pause" size={rf(2.2)} />
          </Pressable>
        </View>

        <View style={styles.boardArea}>
          <ShelfBoard
            board={board}
            boardSize={boardSize}
            columns={config.columns}
            disabled={inputLocked || paused || complete || timeUp}
            matchingIndices={matchingIndices}
            hintIndices={hintIndices}
            onInteraction={registerActivity}
            onMatchAnimationComplete={finishMatchAnimation}
            onDrop={handleDrop}
            onTap={handleTap}
            rows={config.rows}
            selectedIndex={selectedIndex}
          />
          {coinFeedback ? (
            <Text style={styles.coinFeedback}>{coinFeedback}</Text>
          ) : null}
        </View>

        <Text style={styles.instruction}>
          Drag or tap two items to swap • Match 3 on one shelf
        </Text>
        </Animated.View>
      </SafeAreaView>

      <Modal animationType="fade" transparent visible={paused || timeUp}>
        <View style={styles.modalOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>{timeUp ? 'TIME UP!' : 'PAUSED'}</Text>
            {!timeUp ? (
              <Pressable onPress={() => setPaused(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>RESUME</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={restartLevel} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>RESTART LEVEL</Text>
            </Pressable>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.exitText}>Exit to Menu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <LevelCompleteModal
        coins={matchCoins}
        level={level}
        onHome={() => navigation.navigate('MainTabs', {screen: 'Home'})}
        onNext={() => navigation.goBack()}
        score={(matchCoins / config.matchReward) * 1000 + timeLeft * 10}
        stars={timeLeft >= 100 ? 3 : timeLeft >= 50 ? 2 : 1}
        visible={complete}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#43218B'},
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(54, 27, 133, 0.55)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  gameContent: {flex: 1, width: '100%', alignItems: 'center'},
  gameHeader: {
    width: Math.min(wp(92), hp(58)),
    height: Math.min(hp(7.2), wp(15)),
    marginTop: hp(1.2),
    paddingHorizontal: wp(1.8),
    overflow: 'hidden',
    borderRadius: wp(4.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4D1D83',
    borderWidth: wp(0.5),
    borderColor: '#9656D1',
    shadowColor: '#1C0835',
    shadowOffset: {width: 0, height: hp(0.55)},
    shadowOpacity: 0.55,
    shadowRadius: wp(1.2),
    elevation: 10,
  },
  headerHighlight: {
    position: 'absolute', top: 0, left: wp(2), right: wp(2), height: '43%',
    borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerLevelPill: {
    minWidth: wp(21),
    height: Math.min(hp(4.2), wp(9)),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32115E',
    borderWidth: wp(0.25),
    borderColor: '#6F379C',
  },
  headerLevelText: {color: '#FFFFFF', fontSize: rf(1.5), fontWeight: '900'},
  headerTimer: {
    height: '78%', paddingLeft: wp(0.5), paddingRight: wp(3), flexDirection: 'row',
    alignItems: 'center', gap: wp(1), borderRadius: wp(5), backgroundColor: '#291044',
  },
  timerClock: {width: Math.min(hp(5.8), wp(12)), height: Math.min(hp(5.8), wp(12)), marginLeft: -wp(1.2)},
  headerTimerText: {
    color: '#FFFFFF', fontSize: rf(2), fontWeight: '900', letterSpacing: wp(0.12),
    textShadowColor: '#160622', textShadowOffset: {width: 0, height: hp(0.2)}, textShadowRadius: wp(0.5),
  },
  pauseButton: {
    width: Math.min(hp(5.2), wp(11)),
    height: Math.min(hp(5.2), wp(11)),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8340BD',
    borderWidth: wp(0.55),
    borderColor: '#C086EB',
    elevation: 5,
  },
  boardArea: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  coinFeedback: {
    position: 'absolute',
    color: '#FFD53A',
    fontSize: rf(4.2),
    fontWeight: '900',
    textShadowColor: '#633000',
    textShadowOffset: {width: 0, height: hp(0.3)},
    textShadowRadius: wp(1),
  },
  instruction: {
    marginBottom: hp(2),
    color: '#FFFFFF',
    fontSize: rf(1.35),
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 7, 54, 0.75)',
  },
  pauseCard: {
    width: Math.min(wp(80), hp(48)),
    padding: wp(7),
    borderRadius: wp(7),
    backgroundColor: '#6F37B1',
    borderWidth: wp(0.7),
    borderColor: '#A36DDA',
  },
  pauseTitle: {
    color: '#FFE051',
    fontSize: rf(3.4),
    fontWeight: '900',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: hp(3),
    height: hp(6),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4DCD2D',
  },
  modalButtonText: {color: '#FFFFFF', fontSize: rf(2), fontWeight: '900'},
  secondaryButton: {
    marginTop: hp(1.5),
    height: hp(5.5),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#278CD2',
  },
  secondaryText: {color: '#FFFFFF', fontSize: rf(1.65), fontWeight: '900'},
  exitText: {
    marginTop: hp(2),
    color: '#FFFFFF',
    fontSize: rf(1.45),
    textAlign: 'center',
  },
});
