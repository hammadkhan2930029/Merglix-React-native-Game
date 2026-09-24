import React from 'react';
import {Image, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {responsiveFontSize as rf, responsiveHeight as hp, responsiveWidth as wp} from 'react-native-responsive-dimensions';

const ASSETS = {
  magnet: require('../../assets/merglix game elments/magnet element.png'),
  shuffle: require('../../assets/merglix game elments/swipe element.png'),
  freeze: require('../../assets/merglix game elments/3rd element.png'),
};
const COPY = {
  magnet: ['MAGNET UNLOCKED!', 'Find matching products easily. Costs 20 coins per use.'],
  shuffle: ['SHUFFLE UNLOCKED!', 'Create a new product arrangement. Costs 25 coins per use.'],
  freeze: ['FREEZE UNLOCKED!', 'Stop the timer for 10 seconds. Costs 30 coins per use.'],
};

export default function BoosterUnlockModal({booster, onDismiss, visible = true}) {
  if (!booster || !visible) return null;
  return (
    <Modal animationType="fade" statusBarTranslucent transparent visible>
      <View style={styles.overlay}>
        <View style={styles.depth}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>NEW BOOSTER</Text>
            <Image source={ASSETS[booster]} resizeMode="contain" style={styles.asset} />
            <Text style={styles.title}>{COPY[booster][0]}</Text>
            <Text style={styles.description}>{COPY[booster][1]}</Text>
            <Pressable onPress={onDismiss} style={({pressed}) => [styles.buttonDepth, pressed && styles.pressed]}>
              <View style={styles.button}><Text style={styles.buttonText}>AWESOME!</Text></View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(25,6,48,0.82)'},
  depth: {width: Math.min(wp(84), hp(50)), paddingBottom: hp(0.9), borderRadius: wp(8), backgroundColor: '#42116F', elevation: 16},
  card: {padding: wp(6), alignItems: 'center', borderRadius: wp(8), backgroundColor: '#7937B8', borderWidth: wp(0.7), borderColor: '#BC78EB'},
  eyebrow: {color: '#FFD83D', fontSize: rf(1.35), fontWeight: '900', letterSpacing: wp(0.35)},
  asset: {width: Math.min(wp(31), hp(15)), height: Math.min(wp(31), hp(15)), marginTop: hp(1.4)},
  title: {marginTop: hp(1), color: '#FFFFFF', fontSize: rf(2.8), fontWeight: '900', textAlign: 'center'},
  description: {marginTop: hp(1), color: '#F1E4FA', fontSize: rf(1.45), fontWeight: '700', textAlign: 'center'},
  buttonDepth: {width: '100%', height: hp(6.3), marginTop: hp(2.2), paddingBottom: hp(0.55), borderRadius: wp(8), backgroundColor: '#168412'},
  button: {flex: 1, borderRadius: wp(8), alignItems: 'center', justifyContent: 'center', backgroundColor: '#51CE27', borderWidth: wp(0.4), borderColor: '#AFF279'},
  buttonText: {color: '#FFFFFF', fontSize: rf(1.9), fontWeight: '900'},
  pressed: {opacity: 0.86, transform: [{scale: 0.98}]},
});
