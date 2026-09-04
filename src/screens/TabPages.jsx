import React from 'react';
import {Animated, Image, ScrollView, StatusBar, StyleSheet, Switch, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
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
  const players = ['Merglix Pro', 'Puzzle King', 'Merge Master', 'You'];
  return (
    <PageShell title="RANKING">
      <HeroCard color="#7131B8" icon="trophy" title="TOP PLAYERS" description="Climb the ranking by completing levels with high scores." />
      <View style={styles.listCard}>{players.map((name, index) => <View key={name} style={styles.rankRow}><Text style={styles.rankNumber}>{index + 1}</Text><MaterialCommunityIcons color={index < 3 ? '#FFC928' : '#8A45C1'} name="account-circle" size={37} /><Text style={styles.rankName}>{name}</Text><Text style={styles.rankScore}>{index === 3 ? '0' : (4200 - index * 650).toLocaleString()}</Text></View>)}</View>
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

function HeroCard({color, icon, title, description}) {
  return <View style={[styles.hero, {backgroundColor: color}]}><MaterialCommunityIcons color="#FFD33A" name={icon} size={58} /><View style={styles.heroCopy}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroText}>{description}</Text></View></View>;
}
function SectionTitle({children}) { return <Text style={styles.sectionTitle}>{children}</Text>; }
function InfoCard({icon, title, description}) { return <View style={styles.infoCard}><View style={styles.infoIcon}><MaterialCommunityIcons color="#7B37BA" name={icon} size={34} /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoText}>{description}</Text></View></View>; }
function SettingRow({icon, label, value, onChange}) { return <View style={styles.settingRow}><MaterialCommunityIcons color="#7434B5" name={icon} size={31} /><Text style={styles.settingLabel}>{label}</Text><Switch onValueChange={onChange} thumbColor="#FFFFFF" trackColor={{false: '#B5ADA4', true: '#6ECF3D'}} value={value} /></View>; }

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFE8B5'}, safeHeader: {backgroundColor: '#6C28B3'},
  header: {height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 4, borderBottomColor: '#4A168C'},
  headerSpacer: {width: 91}, title: {position: 'absolute', left: 90, right: 90, color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center'},
  coinPill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D155B'}, coinText: {maxWidth: 44, color: '#FFF', fontSize: 12, fontWeight: '900'},
  coinImage: {width: 28, height: 28},
  scroll: {paddingTop: 25, paddingBottom: 125, alignItems: 'center'}, content: {maxWidth: 480},
  hero: {minHeight: 125, padding: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.22)', elevation: 7},
  heroCopy: {flex: 1, marginLeft: 18}, heroTitle: {color: '#FFF', fontSize: 20, fontWeight: '900'}, heroText: {marginTop: 7, color: '#EFE4F8', fontSize: 13, lineHeight: 19},
  sectionTitle: {marginTop: 28, marginBottom: 12, color: '#5B2492', fontSize: 17, fontWeight: '900'},
  infoCard: {minHeight: 86, marginBottom: 12, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0', elevation: 3},
  infoIcon: {width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9D2F7'}, infoCopy: {flex: 1, marginLeft: 14}, infoTitle: {color: '#4B214E', fontSize: 16, fontWeight: '900'}, infoText: {marginTop: 4, color: '#806B72', fontSize: 12, lineHeight: 17},
  listCard: {overflow: 'hidden', borderRadius: 16, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F1D4A0', elevation: 4},
  rankRow: {height: 67, paddingHorizontal: 14, gap: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8D3AE'}, rankNumber: {width: 24, color: '#68309C', fontSize: 18, fontWeight: '900'}, rankName: {flex: 1, color: '#4B294A', fontSize: 14, fontWeight: '800'}, rankScore: {color: '#68309C', fontSize: 14, fontWeight: '900'},
  settingRow: {height: 72, paddingHorizontal: 17, gap: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8D3AE'}, settingLabel: {flex: 1, color: '#4B294A', fontSize: 16, fontWeight: '800'},
});
