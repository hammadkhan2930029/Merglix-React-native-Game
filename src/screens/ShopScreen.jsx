import React, {useState} from 'react';
import {Alert, Animated, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useGameProgress} from '../context/GameProgressContext';
import useEntranceAnimation from '../hooks/useEntranceAnimation';

const TABS = ['COINS', 'BOOSTERS', 'LIVES'];
const coin3d = require('../assets/coin-3d.png');
const COIN_PACKAGES = [
  {id: 'coins_500', coins: 500, priceLabel: 'Rs 160', icon: 'currency-usd-circle'},
  {id: 'coins_1200', coins: 1200, priceLabel: 'Rs 300', icon: 'circle-multiple'},
  {id: 'coins_2500', coins: 2500, priceLabel: 'Rs 540', icon: 'sack'},
  {id: 'coins_5500', coins: 5500, priceLabel: 'Rs 1,100', icon: 'safe-square-outline'},
];

export default function ShopScreen({navigation}) {
  const {width} = useWindowDimensions();
  const {coins} = useGameProgress();
  const [selectedTab, setSelectedTab] = useState('COINS');
  const entranceStyle = useEntranceAnimation(60, 22);
  const contentWidth = Math.min(width * 0.92, 480);

  const handlePurchase = productId => {
    Alert.alert('Purchases unavailable', `Product ${productId} is ready for future store integration. No payment was made and no coins were added.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="#6C28B3" barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#FFFFFF" name="chevron-left" size={29} />
          </Pressable>
          <Text style={styles.headerTitle}>SHOP</Text>
          <View style={styles.balancePill}>
            <Image source={coin3d} resizeMode="contain" style={styles.balanceCoin} />
            <Text numberOfLines={1} style={styles.balanceText}>{coins}</Text>
            <MaterialCommunityIcons color="#55DC3C" name="plus-circle" size={17} />
          </View>
        </View>
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <Pressable key={tab} onPress={() => setSelectedTab(tab)} style={({pressed}) => [styles.tab, selectedTab === tab && styles.activeTab, pressed && styles.pressed]}>
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, {width: contentWidth}, entranceStyle]}>
          {selectedTab === 'COINS' ? (
            <>
              {COIN_PACKAGES.map((item, index) => (
                <ShopItemCard item={item} key={item.id} popular={index === 2} onPurchase={handlePurchase} />
              ))}
              <RemoveAdsCard onPurchase={handlePurchase} />
            </>
          ) : (
            <EmptyCategory category={selectedTab} />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ShopItemCard({item, popular, onPurchase}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.productIcon}>
        <Image source={coin3d} resizeMode="contain" style={styles.productCoin} />
        {popular ? <Text style={styles.popular}>POPULAR</Text> : null}
      </View>
      <Text style={styles.amount}>{item.coins.toLocaleString()}</Text>
      <Pressable accessibilityLabel={`Buy ${item.coins} coins for ${item.priceLabel}`} onPress={() => onPurchase(item.id)} style={({pressed}) => [styles.priceDepth, pressed && styles.buttonPressed]}>
        <View style={styles.priceButton}><Text style={styles.priceText}>{item.priceLabel}</Text></View>
      </Pressable>
    </View>
  );
}

function RemoveAdsCard({onPurchase}) {
  return (
    <View style={styles.adsCard}>
      <View style={styles.adsIcon}><MaterialCommunityIcons color="#FFFFFF" name="advertisements-off" size={38} /></View>
      <View style={styles.adsCopy}><Text style={styles.adsTitle}>REMOVE ADS</Text><Text style={styles.adsDescription}>Enjoy the game{`\n`}without ads</Text></View>
      <Pressable onPress={() => onPurchase('remove_ads')} style={({pressed}) => [styles.adsPriceButton, pressed && styles.buttonPressed]}><Text style={styles.adsPrice}>Rs 700</Text></Pressable>
    </View>
  );
}

function EmptyCategory({category}) {
  return (
    <View style={styles.emptyCard}>
      <MaterialCommunityIcons color="#7D3CBD" name={category === 'LIVES' ? 'heart' : 'rocket-launch'} size={58} />
      <Text style={styles.emptyTitle}>{category} COMING SOON</Text>
      <Text style={styles.emptyText}>New items will be available here in a future update.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFE8B5'},
  headerSafeArea: {backgroundColor: '#6C28B3'},
  header: {height: 57, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backButton: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8243C5'},
  headerTitle: {position: 'absolute', left: 78, right: 78, color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center'},
  balancePill: {minWidth: 91, height: 31, paddingHorizontal: 7, gap: 5, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D155B'},
  balanceText: {maxWidth: 46, color: '#FFF', fontSize: 12, fontWeight: '900'},
  balanceCoin: {width: 28, height: 28},
  tabs: {height: 49, paddingHorizontal: 12, paddingBottom: 7, gap: 7, flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: '#4A168C'},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#3A176B', elevation: 3},
  activeTab: {backgroundColor: '#FFBA16', borderWidth: 2, borderColor: '#FFD65B'},
  tabText: {color: '#E9DDF5', fontSize: 13, fontWeight: '900'},
  activeTabText: {color: '#FFF'},
  scrollContent: {paddingTop: 15, paddingBottom: 120, alignItems: 'center'},
  content: {maxWidth: 480},
  itemCard: {height: 82, marginBottom: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderRadius: 13, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F3D8A5', shadowColor: '#A66E28', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3},
  productIcon: {width: 55, alignItems: 'center', justifyContent: 'center'},
  productCoin: {width: 50, height: 50},
  popular: {position: 'absolute', bottom: -6, paddingHorizontal: 4, borderRadius: 3, color: '#FFF', fontSize: 7, fontWeight: '900', backgroundColor: '#F04B3E'},
  amount: {flex: 1, marginLeft: 10, color: '#3A1A16', fontSize: 21, fontWeight: '900'},
  priceDepth: {width: 101, height: 45, paddingBottom: 5, borderRadius: 10, backgroundColor: '#208B1D'},
  priceButton: {flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#49C93D', borderWidth: 2, borderColor: '#6CDD61'},
  priceText: {color: '#FFF', fontSize: 13, fontWeight: '900'},
  adsCard: {minHeight: 104, marginTop: 21, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderRadius: 15, backgroundColor: '#7435B5', borderWidth: 2, borderColor: '#8E52CB', elevation: 6},
  adsIcon: {width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E54D45', borderWidth: 3, borderColor: '#FFABA4'},
  adsCopy: {flex: 1, marginLeft: 12},
  adsTitle: {color: '#FFF', fontSize: 15, fontWeight: '900'},
  adsDescription: {marginTop: 5, color: '#EEE3F8', fontSize: 10, lineHeight: 14},
  adsPriceButton: {minWidth: 82, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#FFC92C', borderWidth: 2, borderColor: '#FFE16E'},
  adsPrice: {color: '#FFF', fontSize: 13, fontWeight: '900'},
  emptyCard: {marginTop: 30, padding: 32, alignItems: 'center', borderRadius: 18, backgroundColor: '#FFF3D5', borderWidth: 2, borderColor: '#F3D8A5'},
  emptyTitle: {marginTop: 13, color: '#5E2696', fontSize: 19, fontWeight: '900'},
  emptyText: {marginTop: 8, color: '#7D6381', fontSize: 13, textAlign: 'center'},
  pressed: {opacity: 0.72},
  buttonPressed: {opacity: 0.84, transform: [{scale: 0.96}]},
});
