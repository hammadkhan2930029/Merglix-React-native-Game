import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  responsiveWidth as widthPercentageToDP,
  responsiveHeight as heightPercentageToDP,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

const wp = widthPercentageToDP;
const hp = heightPercentageToDP;

const TAB_ICONS = {
  Store: 'storefront',
  Events: 'calendar-star',
  Home: 'home-outline',
  Ranking: 'podium',
  Settings: 'cog',
};

export default function GameTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Math.min(hp(8.8), wp(18));
  const bottomOffset = Math.max(insets.bottom, hp(0.8));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabBarOverlay, { bottom: bottomOffset }]}>
      <View
        style={[styles.tabBar, { height: tabBarHeight }]}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              key={route.key}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && styles.activeTabItem,
                pressed && styles.pressed,
              ]}>
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer,
                ]}>
                <MaterialCommunityIcons
                  color={isFocused ? '#FFC42F' : '#E9DDF4'}
                  name={TAB_ICONS[route.name] ?? 'circle'}
                  size={isFocused ? rf(4.3) : rf(3.2)}
                  style={isFocused ? styles.activeIconGlyph : undefined}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, isFocused && styles.activeLabel]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const maxBarWidth = Math.min(wp(96), hp(57));

const styles = StyleSheet.create({
  tabBarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    width: maxBarWidth,
    height: '20%',
    paddingHorizontal: wp(1.1),
    borderRadius: wp(5.5),
    backgroundColor: '#7138AD',
    borderWidth: wp(0.35),
    borderColor: '#8E55C4',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    shadowColor: '#3A175A',
    shadowOffset: { width: 0, height: hp(0.45) },
    shadowOpacity: 0.5,
    shadowRadius: wp(1.3),
    elevation: 12,
  },
  tabItem: {
    width: '19%',
    height: '100%',
    paddingTop: hp(0.35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    transform: [{ translateY: -hp(1.15) }],
  },
  iconContainer: {
    width: Math.min(wp(11), hp(5.5)),
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    width: Math.min(wp(14.5), hp(7.2)),
    borderRadius: wp(3),
    backgroundColor: '#63309B',
    borderWidth: wp(0.65),
    borderColor: '#F0A329',
    shadowColor: '#34134F',
    shadowOffset: { width: 0, height: hp(0.25) },
    shadowOpacity: 0.5,
    shadowRadius: wp(0.8),
    elevation: 8,
    transform: [{ rotate: '45deg' }],
  },
  activeIconGlyph: {
    transform: [{ rotate: '-45deg' }],
  },
  label: {
    marginTop: hp(0.1),
    color: '#F2EAF8',
    fontSize: rf(1.8),
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    transform: [{ translateY: hp(0.35) }],
  },
  pressed: {
    opacity: 0.72,
  },
});
