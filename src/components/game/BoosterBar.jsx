import React, {memo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  responsiveFontSize as rf,
  responsiveHeight as hp,
  responsiveWidth as wp,
} from 'react-native-responsive-dimensions';

const magnetAsset = require('../../assets/merglix game elments/magnet element.png');
const shuffleAsset = require('../../assets/merglix game elments/swipe element.png');
const freezeAsset = require('../../assets/merglix game elments/3rd element.png');

function BoosterButton({label, quantity, active, busy, source, onPress}) {
  const disabled = quantity <= 0 || busy || active;
  return (
    <Pressable
      accessibilityLabel={`${label}, ${quantity} remaining`}
      accessibilityRole="button"
      accessibilityState={{disabled, busy, selected: active}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.buttonDepth,
        active && styles.activeDepth,
        disabled && !active && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.button, active && styles.activeButton]}>
        <Image source={source} resizeMode="contain" style={styles.iconImage} />
        <Text numberOfLines={1} style={styles.label}>{label}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>×{quantity}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function BoosterBar({boosters, busy, magnetActive, shuffleActive, freezeActive,
  onMagnet, onShuffle, onFreeze}) {
  return (
    <View style={styles.bar}>
      <BoosterButton
        active={magnetActive}
        busy={busy}
        label="MAGNET"
        onPress={onMagnet}
        quantity={boosters.magnet}
        source={magnetAsset}
      />
      <BoosterButton
        active={shuffleActive}
        busy={busy}
        label="SHUFFLE"
        onPress={onShuffle}
        quantity={boosters.shuffle}
        source={shuffleAsset}
      />
      <BoosterButton
        active={freezeActive}
        busy={busy}
        label="FREEZE"
        onPress={onFreeze}
        quantity={boosters.freeze}
        source={freezeAsset}
      />
    </View>
  );
}

export default memo(BoosterBar);

const styles = StyleSheet.create({
  bar: {
    width: Math.min(wp(94), hp(62)),
    height: Math.min(hp(10.5), wp(22)),
    marginBottom: hp(0.8),
    paddingHorizontal: wp(1.8),
    gap: wp(2.2),
    borderRadius: wp(4.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D1D83',
    borderWidth: wp(0.45),
    borderColor: '#9656D1',
    elevation: 8,
  },
  buttonDepth: {
    flex: 1,
    height: '84%',
    paddingBottom: hp(0.55),
    borderRadius: wp(3.2),
    backgroundColor: '#35115F',
  },
  button: {
    flex: 1,
    borderRadius: wp(3.2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(0.8),
    backgroundColor: '#7839BA',
    borderWidth: wp(0.3),
    borderColor: '#A873DA',
  },
  activeDepth: {backgroundColor: '#147DA7'},
  activeButton: {backgroundColor: '#25B8E4', borderColor: '#CFF8FF'},
  iconImage: {
    width: Math.min(wp(11.5), hp(6.2)),
    height: Math.min(wp(11.5), hp(6.2)),
  },
  label: {color: '#FFFFFF', fontSize: rf(1.25), fontWeight: '900'},
  badge: {
    position: 'absolute',
    right: -wp(1),
    top: -hp(0.8),
    minWidth: wp(7.5),
    height: hp(2.9),
    paddingHorizontal: wp(1.3),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD52A',
    borderWidth: wp(0.25),
    borderColor: '#FFF3A5',
  },
  badgeText: {color: '#4B246F', fontSize: rf(1.15), fontWeight: '900'},
  disabled: {opacity: 0.42},
  pressed: {opacity: 0.85, transform: [{scale: 0.95}]},
});
