import React, {useState} from 'react';
import {Animated, Image, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import DailyCheckInCard from '../components/checkin/DailyCheckInCard';
import {getTotalBestScore} from '../game/ranking';
const coin3d = require('../assets/coin-3d.png');

function PageShell({title, children}) {
  const {width} = useWindowDimensions();
  const {coins} = useGameProgress();
  const entranceStyle = useEntranceAnimation(60, 22);
  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="#6C28B3" barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.coinPill}><Image source={coin3d} resizeMode="contain" style={styles.coinImage} /><Text style={styles.coinText}>{coins}</Text><MaterialCommunityIcons color="#55DC3C" name="plus-circle" size={17} /></View>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, {width: Math.min(width * 0.9, 480)}, entranceStyle]}>{children}</Animated.View>
      </ScrollView>
    </View>
  );
}

export function EventsScreen() {
  return (
    <PageShell title="EVENTS">
      <HeroCard color="#7B37BA" icon="calendar-star" title="DAILY CHALLENGE" description="Complete today’s challenge and earn bonus rewards." />
      <SectionTitle>UPCOMING EVENTS</SectionTitle>
      <InfoCard icon="clock-outline" title="WEEKEND RUSH" description="New timed matching challenges are coming soon." />
      <InfoCard icon="gift-outline" title="REWARD FEST" description="Collect special prizes in future events." />
    </PageShell>
  );
}

export function RankingScreen() {
  const {coins, levelScores} = useGameProgress();
  const [section, setSection] = useState('leaderboard');
  const totalScore = getTotalBestScore(levelScores);
  const showingCoins = section === 'leaderboard';
  return (
    <PageShell title="RANKING">
      <View style={styles.rankingTabs}>
        <RankingTab active={showingCoins} image={coin3d} label="LEADERBOARD" onPress={() => setSection('leaderboard')} />
        <RankingTab active={!showingCoins} icon="trophy" label="SCORE BOARD" onPress={() => setSection('scores')} />
      </View>
      <HeroCard
        color="#7131B8"
        icon={showingCoins ? undefined : 'trophy'}
        image={showingCoins ? coin3d : undefined}
        title={showingCoins ? 'COINS LEADERBOARD' : 'OVERALL SCORE BOARD'}
        description={showingCoins ? 'Ranking based on your locally saved total coins.' : 'Ranking based on your locally saved overall score.'}
      />
      <View style={styles.leaderboardTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeading, styles.separateRankColumn]}>RANK</Text>
          <Text style={[styles.tableHeading, styles.separateNameColumn]}>USER NAME</Text>
          <Text style={[styles.tableHeading, styles.separateValueColumn]}>{showingCoins ? 'TOTAL COINS' : 'OVERALL SCORE'}</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.numberOneBadge}><Text style={styles.numberOneText}>1</Text></View>
          <View style={styles.separateUserCell}>
            <MaterialCommunityIcons color="#7B37BA" name="account-circle" size={34} />
            <Text numberOfLines={1} style={styles.tableUserName}>YOU</Text>
          </View>
          {showingCoins ? <View style={styles.separateValueCell}><Image source={coin3d} resizeMode="contain" style={styles.tableCoinImage} /><Text numberOfLines={1} style={styles.tableCoins}>{coins.toLocaleString()}</Text></View>
            : <Text numberOfLines={1} style={styles.separateScore}>{totalScore.toLocaleString()}</Text>}
        </View>
      </View>
    </PageShell>
  );
}

export function CheckInScreen() {
  return (
    <PageShell title="CHECK-IN">
      <DailyCheckInCard />
    </PageShell>
  );
}

export function SettingsScreen() {
  const {settings, updateSettings} = useGameProgress();
  return (
    <PageShell title="SETTINGS">
      <View style={styles.listCard}>
        <SettingRow icon="volume-high" label="Sound Effects" onChange={value => updateSettings({sound: value})} value={settings.sound} />
        <SettingRow icon="music" label="Music" onChange={value => updateSettings({music: value})} value={settings.music} />
        <SettingRow icon="vibrate" label="Vibration" onChange={value => updateSettings({vibration: value})} value={settings.vibration} />
      </View>
      <SectionTitle>GAME</SectionTitle>
      <InfoCard icon="information-outline" title="MERGLIX" description="Match. Merge. Win!  Version 1.0" />
    </PageShell>
  );
}

function HeroCard({color, icon, image, title, description}) {
  return <View style={[styles.hero, {backgroundColor: color}]}>{image ? <Image source={image} resizeMode="contain" style={styles.heroAsset} /> : <MaterialCommunityIcons color="#FFD33A" name={icon} size={58} />}<View style={styles.heroCopy}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroText}>{description}</Text></View></View>;
}
function SectionTitle({children}) { return <Text style={styles.sectionTitle}>{children}</Text>; }
function InfoCard({icon, title, description}) { return <View style={styles.infoCard}><View style={styles.infoIcon}><MaterialCommunityIcons color="#7B37BA" name={icon} size={34} /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoText}>{description}</Text></View></View>; }
function SettingRow({icon, label, value, onChange}) { return <View style={styles.settingRow}><MaterialCommunityIcons color="#7434B5" name={icon} size={31} /><Text style={styles.settingLabel}>{label}</Text><Switch onValueChange={onChange} thumbColor="#FFFFFF" trackColor={{false: '#B5ADA4', true: '#6ECF3D'}} value={value} /></View>; }
function RankingTab({active, icon, image, label, onPress}) { return <Pressable onPress={onPress} style={({pressed}) => [styles.rankingTab, active && styles.rankingTabActive, pressed && styles.pressed]}>{image ? <Image source={image} resizeMode="contain" style={styles.rankingTabAsset} /> : <MaterialCommunityIcons color={active ? '#FFFFFF' : '#D9C2E9'} name={icon} size={22} />}<Text style={[styles.rankingTabText, active && styles.rankingTabTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFE8B5'}, safeHeader: {backgroundColor: '#6C28B3'},
  header: {height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 4, borderBottomColor: '#4A168C'},
  headerSpacer: {width: 91}, title: {position: 'absolute', left: 90, right: 90, color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center'},
  coinPill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D155B'}, coinText: {maxWidth: 44, color: '#FFF', fontSize: 12, fontWeight: '900'},
  coinImage: {width: 28, height: 28},
  scroll: {paddingTop: 25, paddingBottom: 125, alignItems: 'center'}, content: {maxWidth: 480},
  hero: {minHeight: 125, padding: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.22)', elevation: 7},
  heroAsset: {width: 64, height: 64},
  heroCopy: {flex: 1, marginLeft: 18}, heroTitle: {color: '#FFF', fontSize: 20, fontWeight: '900'}, heroText: {marginTop: 7, color: '#EFE4F8', fontSize: 13, lineHeight: 19},
  sectionTitle: {marginTop: 28, marginBottom: 12, color: '#5B2492', fontSize: 17, fontWeight: '900'},
  infoCard: {minHeight: 86, marginBottom: 12, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0', elevation: 3},
  infoIcon: {width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9D2F7'}, infoCopy: {flex: 1, marginLeft: 14}, infoTitle: {color: '#4B214E', fontSize: 16, fontWeight: '900'}, infoText: {marginTop: 4, color: '#806B72', fontSize: 12, lineHeight: 17},
  listCard: {overflow: 'hidden', borderRadius: 16, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0', elevation: 4},
  rankRow: {height: 67, paddingHorizontal: 14, gap: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8D3AE'}, rankNumber: {width: 24, color: '#68309C', fontSize: 18, fontWeight: '900'}, rankName: {flex: 1, color: '#4B294A', fontSize: 14, fontWeight: '800'}, rankScore: {color: '#68309C', fontSize: 14, fontWeight: '900'},
  settingRow: {height: 72, paddingHorizontal: 17, gap: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8D3AE'}, settingLabel: {flex: 1, color: '#4B294A', fontSize: 16, fontWeight: '800'},
  leaderboardTable: {marginTop: 18, overflow: 'hidden', borderRadius: 16, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#EACB91', elevation: 6},
  tableHeader: {minHeight: 48, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#552184'},
  tableHeading: {color: '#FFF4C8', fontSize: 9, fontWeight: '900', textAlign: 'center'},
  rankColumn: {width: '13%'}, nameColumn: {width: '29%'}, scoreColumn: {width: '31%'}, coinsColumn: {width: '27%'},
  tableRow: {minHeight: 82, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3D5'},
  numberOneBadge: {width: 32, height: 32, marginHorizontal: '2.5%', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFD13A', borderWidth: 2, borderColor: '#FFF0A1'},
  numberOneText: {color: '#57216E', fontSize: 17, fontWeight: '900'},
  userCell: {width: '29%', gap: 4, flexDirection: 'row', alignItems: 'center'},
  tableUserName: {flex: 1, color: '#4B294A', fontSize: 13, fontWeight: '900'},
  tableScore: {width: '31%', color: '#68309C', fontSize: 16, fontWeight: '900', textAlign: 'center'},
  coinsCell: {width: '27%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  tableCoinImage: {width: 30, height: 30}, tableCoins: {maxWidth: 58, color: '#744004', fontSize: 14, fontWeight: '900'},
  separateRankColumn: {width: '18%'}, separateNameColumn: {width: '42%'}, separateValueColumn: {width: '40%'},
  separateUserCell: {width: '42%', gap: 7, paddingLeft: 7, flexDirection: 'row', alignItems: 'center'},
  separateValueCell: {width: '40%', gap: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  separateScore: {width: '40%', color: '#68309C', fontSize: 18, fontWeight: '900', textAlign: 'center'},
  rankingTabs: {height: 54, marginBottom: 17, padding: 5, gap: 6, borderRadius: 14, flexDirection: 'row', backgroundColor: '#4A1A78', elevation: 5},
  rankingTab: {flex: 1, gap: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  rankingTabActive: {backgroundColor: '#8A42C8', borderWidth: 1, borderColor: '#B973E7'},
  rankingTabText: {color: '#D9C2E9', fontSize: 11, fontWeight: '900'},
  rankingTabTextActive: {color: '#FFFFFF'},
  rankingTabAsset: {width: 29, height: 29},
  playerCardDepth: {marginTop: 16, paddingBottom: 7, borderRadius: 18, backgroundColor: '#4B197A', elevation: 8},
  playerCard: {minHeight: 92, paddingHorizontal: 13, gap: 9, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#8342C2', borderWidth: 2, borderColor: '#B97BE5'},
  rankBadge: {width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFD03B', borderWidth: 2, borderColor: '#FFF0A1'},
  rankBadgeText: {color: '#58246F', fontSize: 19, fontWeight: '900'},
  playerCopy: {flex: 1}, playerName: {color: '#FFFFFF', fontSize: 18, fontWeight: '900'}, playerLevel: {marginTop: 3, color: '#E8D3F6', fontSize: 10, fontWeight: '800'},
  playerStats: {alignItems: 'flex-end'}, playerScore: {color: '#FFD53C', fontSize: 20, fontWeight: '900'}, playerScoreLabel: {color: '#F2E5FA', fontSize: 9, fontWeight: '900'},
  totalCoinsCard: {minHeight: 105, marginTop: 14, paddingHorizontal: 24, gap: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0', elevation: 4},
  totalCoinsImage: {width: 64, height: 64}, totalCoinsCopy: {alignItems: 'flex-start'}, totalCoinsValue: {color: '#623090', fontSize: 30, fontWeight: '900'}, totalCoinsLabel: {color: '#806B72', fontSize: 12, fontWeight: '900'},
  overallScoreCard: {minHeight: 105, marginVertical: 14, paddingHorizontal: 22, gap: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#57238A', borderWidth: 2, borderColor: '#9D5CD0', elevation: 5},
  overallScoreCopy: {alignItems: 'flex-start'}, overallScoreValue: {color: '#FFD53C', fontSize: 31, fontWeight: '900'}, overallScoreLabel: {color: '#F5E9FC', fontSize: 12, fontWeight: '900'},
  scoreRow: {minHeight: 75, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8D3AE'},
  levelCircle: {width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7D3DBB'}, levelCircleText: {color: '#FFFFFF', fontSize: 17, fontWeight: '900'},
  scoreCopy: {flex: 1, marginLeft: 12}, scoreLevel: {color: '#4B294A', fontSize: 14, fontWeight: '900'}, scoreSaved: {marginTop: 3, color: '#927F84', fontSize: 9, fontWeight: '900'},
  scoreValueWrap: {alignItems: 'flex-end'}, scoreValue: {color: '#68309C', fontSize: 17, fontWeight: '900'}, scoreValueLabel: {color: '#927F84', fontSize: 8, fontWeight: '900'},
  emptyCard: {minHeight: 180, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0'}, emptyTitle: {marginTop: 8, color: '#5B2787', fontSize: 17, fontWeight: '900'}, emptyText: {marginTop: 5, color: '#806B72', fontSize: 12},
  pressed: {opacity: 0.76},
});
