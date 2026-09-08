import React from 'react';
import {Animated, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import {LEVEL_CONFIGS} from '../game/levelConfigs';

const WORLDS = [
  {id: 1, levels: Array.from({length: 16}, (_, index) => index + 1)},
  {id: 2, levels: Array.from({length: 4}, (_, index) => index + 17)},
];
const coin3d = require('../assets/coin-3d.png');

export default function LevelSelectScreen({navigation}) {
  const {width} = useWindowDimensions();
  const {coins, level: unlockedLevel, levelStars = {}} = useGameProgress();
  const entranceStyle = useEntranceAnimation(70, 24);
  const contentWidth = Math.min(width * 0.9, 500);
  const gap = Math.max(12, Math.min(22, contentWidth * 0.065));
  const cardSize = (contentWidth - gap * 2) / 3;

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="#6B28B2" barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#FFFFFF" name="chevron-left" size={34} />
          </Pressable>
          <Text style={styles.headerTitle}>LEVELS</Text>
          <View style={styles.coinPill}>
            <Image source={coin3d} resizeMode="contain" style={styles.coinImage} />
            <Text numberOfLines={1} style={styles.coinText}>{coins}</Text>
            <MaterialCommunityIcons color="#52DF36" name="plus-circle" size={17} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, {width: contentWidth}, entranceStyle]}>
          {WORLDS.map(world => (
            <WorldSection
              cardSize={cardSize}
              gap={gap}
              key={world.id}
              levelStars={levelStars}
              unlockedLevel={unlockedLevel}
              navigation={navigation}
              world={world}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function WorldSection({world, cardSize, gap, levelStars, navigation, unlockedLevel}) {
  return (
    <View style={[styles.worldSection, world.id === 2 && styles.secondWorld]}>
      <View style={styles.ribbonWrap}>
        <View style={styles.ribbonTailLeft} /><View style={styles.ribbonTailRight} />
        <View style={styles.ribbon}><Text style={styles.ribbonText}>WORLD {world.id}</Text></View>
      </View>
      <View style={[styles.grid, {gap}]}>
        {world.levels.map(levelNumber => (
          <LevelCard
            key={levelNumber}
            level={levelNumber}
            locked={levelNumber > unlockedLevel || !LEVEL_CONFIGS[levelNumber]}
            onPress={() => navigation.navigate('Gameplay', {level: levelNumber})}
            size={cardSize}
            stars={levelStars[levelNumber] ?? 0}
          />
        ))}
      </View>
    </View>
  );
}

function LevelCard({level, locked, stars, size, onPress}) {
  return (
    <Pressable
      accessibilityLabel={locked ? `Level ${level}, locked` : `Level ${level}`}
      accessibilityRole="button"
      accessibilityState={{disabled: locked}}
      disabled={locked}
      onPress={onPress}
      style={({pressed}) => [styles.levelDepth, {width: size, height: size}, locked && styles.lockedDepth, pressed && styles.cardPressed]}>
      <View style={[styles.levelCard, locked && styles.lockedCard]}>
        {locked ? (
          <MaterialCommunityIcons color="#625E58" name="lock" size={size * 0.43} />
        ) : (
          <>
            <Text style={[styles.levelNumber, {fontSize: size * 0.36}]}>{level}</Text>
            <View style={styles.starRow}>
              {[1, 2, 3].map(star => <MaterialCommunityIcons color={star <= stars ? '#FFD628' : '#D5B5E3'} key={star} name="star" size={size * 0.22} />)}
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFE8B4'},
  headerSafeArea: {backgroundColor: '#6B28B2'},
  header: {height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#6B28B2', borderBottomWidth: 4, borderBottomColor: '#4A168C'},
  backButton: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8243C5'},
  headerTitle: {position: 'absolute', left: 76, right: 76, color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center'},
  coinPill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D155B'},
  coinText: {maxWidth: 46, color: '#FFF', fontSize: 12, fontWeight: '900'},
  coinImage: {width: 28, height: 28},
  scrollContent: {paddingTop: 48, paddingBottom: 55, alignItems: 'center'},
  content: {maxWidth: 500},
  worldSection: {marginBottom: 20},
  secondWorld: {marginTop: 55},
  ribbonWrap: {width: 190, height: 54, marginBottom: 35, alignSelf: 'center', justifyContent: 'center'},
  ribbon: {zIndex: 2, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#7131B8', borderWidth: 2, borderColor: '#592193'},
  ribbonTailLeft: {position: 'absolute', left: -10, width: 35, height: 28, backgroundColor: '#6022A0', transform: [{rotate: '-9deg'}]},
  ribbonTailRight: {position: 'absolute', right: -10, width: 35, height: 28, backgroundColor: '#6022A0', transform: [{rotate: '9deg'}]},
  ribbonText: {color: '#FFF', fontSize: 17, fontWeight: '900'},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  levelDepth: {borderRadius: 14, paddingBottom: 8, backgroundColor: '#57208F', shadowColor: '#5B5148', shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.42, shadowRadius: 6, elevation: 8},
  levelCard: {flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#8245CA', borderWidth: 3, borderColor: '#A978DD'},
  levelNumber: {color: '#FFF', fontWeight: '900', textShadowColor: '#4B1A7C', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 1},
  starRow: {position: 'absolute', bottom: 7, flexDirection: 'row'},
  lockedDepth: {backgroundColor: '#827B73'},
  lockedCard: {backgroundColor: '#A9A29A', borderColor: '#D1CBC3'},
  pressed: {opacity: 0.7},
  cardPressed: {opacity: 0.84, transform: [{scale: 0.94}]},
});
