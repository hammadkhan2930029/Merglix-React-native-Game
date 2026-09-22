import React from 'react';
import {Image, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {responsiveHeight as hp, responsiveWidth as wp, responsiveFontSize as rf} from 'react-native-responsive-dimensions';
import {canContinueAfterTimeUp, getContinueSeconds} from '../../game/timeUpConfig';

const timerClock = require('../../assets/timer-clock-3d.png');

export default function TimeUpModal({adStatus, completedMatches, continuesUsed,
  onContinue, onHome, onRestart, targetMatches, visible}) {
  const canContinue = canContinueAfterTimeUp(continuesUsed);
  const seconds = getContinueSeconds(continuesUsed);
  const adBusy = ['loading', 'showing', 'earned', 'earnedClosed'].includes(adStatus);
  const continueLabel = adStatus === 'showing' ? 'PLAYING AD...'
    : adStatus === 'loading' ? 'LOADING AD...'
      : adStatus === 'error' ? 'RETRY AD'
        : `WATCH AD & GET ${seconds} SEC`;

  return (
    <Modal animationType="fade" statusBarTranslucent transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.depth}>
          <View style={styles.card}>
            <View pointerEvents="none" style={styles.highlight} />
            <Image source={timerClock} resizeMode="contain" style={styles.clock} />
            <Text style={styles.title}>TIME'S UP!</Text>
            <Text style={styles.progress}>MATCHES  {completedMatches}/{targetMatches}</Text>
            {canContinue ? (
              <>
                <Text style={styles.description}>Watch the complete ad to continue from the same board.</Text>
                <Pressable disabled={adBusy} onPress={onContinue}
                  style={({pressed}) => [styles.continueDepth, adBusy && styles.disabled, pressed && styles.pressed]}>
                  <View style={styles.continueButton}>
                    <MaterialCommunityIcons color="#FFFFFF" name="play-circle" size={rf(2.7)} />
                    <Text style={styles.continueText}>{continueLabel}</Text>
                  </View>
                </Pressable>
              </>
            ) : (
              <Text style={styles.description}>No continues left for this attempt.</Text>
            )}
            <Pressable onPress={onRestart} style={({pressed}) => [styles.restartButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#FFFFFF" name="restart" size={rf(2.4)} />
              <Text style={styles.secondaryText}>RESTART</Text>
            </Pressable>
            {!canContinue ? (
              <Pressable onPress={onHome} style={({pressed}) => [styles.homeButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons color="#FFFFFF" name="home" size={rf(2.3)} />
                <Text style={styles.secondaryText}>HOME</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(24,5,45,0.82)'},
  depth: {width: Math.min(wp(86), hp(52)), paddingBottom: hp(1), borderRadius: wp(8), backgroundColor: '#42116F', elevation: 16},
  card: {overflow: 'hidden', paddingHorizontal: wp(6), paddingTop: hp(2), paddingBottom: hp(3), alignItems: 'center', borderRadius: wp(8), backgroundColor: '#7735B7', borderWidth: wp(0.7), borderColor: '#B96FE8'},
  highlight: {position: 'absolute', top: 0, left: wp(3), right: wp(3), height: '32%', borderRadius: wp(7), backgroundColor: 'rgba(255,255,255,0.08)'},
  clock: {width: Math.min(wp(31), hp(15)), height: Math.min(wp(31), hp(15))},
  title: {marginTop: -hp(1), color: '#FFE052', fontSize: rf(3.7), fontWeight: '900', textAlign: 'center', textShadowColor: '#3D155B', textShadowOffset: {width: 0, height: hp(0.3)}, textShadowRadius: wp(0.5)},
  progress: {marginTop: hp(1.1), paddingHorizontal: wp(5), paddingVertical: hp(0.8), borderRadius: wp(5), color: '#FFFFFF', fontSize: rf(1.55), fontWeight: '900', backgroundColor: '#43196D'},
  description: {width: '90%', marginTop: hp(1.5), color: '#F4E9FF', fontSize: rf(1.35), fontWeight: '700', lineHeight: rf(1.9), textAlign: 'center'},
  continueDepth: {width: '100%', height: hp(7), marginTop: hp(2), paddingBottom: hp(0.65), borderRadius: wp(8), backgroundColor: '#A94C00', elevation: 9},
  continueButton: {flex: 1, gap: wp(2), borderRadius: wp(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF9E12', borderWidth: wp(0.45), borderColor: '#FFD96B'},
  continueText: {color: '#FFFFFF', fontSize: rf(1.75), fontWeight: '900', textAlign: 'center'},
  restartButton: {width: '100%', height: hp(6), marginTop: hp(1.5), gap: wp(2), borderRadius: wp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#238BD1'},
  homeButton: {width: '100%', height: hp(5.8), marginTop: hp(1.2), gap: wp(2), borderRadius: wp(7), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4C256F'},
  secondaryText: {color: '#FFFFFF', fontSize: rf(1.7), fontWeight: '900'},
  disabled: {opacity: 0.68},
  pressed: {opacity: 0.86, transform: [{scale: 0.98}]},
});
