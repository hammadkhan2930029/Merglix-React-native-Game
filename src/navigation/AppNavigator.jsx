import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import GameTabBar from '../components/GameTabBar';
import MainMenuScreen from '../screens/MainMenuScreen';
import GameplayScreen from '../screens/GameplayScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';
import RewardsScreen from '../screens/RewardsScreen';
import {CheckInScreen, RankingScreen, SettingsScreen} from '../screens/TabPages';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeScreen({navigation}) {
  return (
    <MainMenuScreen
      onDailyReward={() => navigation.navigate('Rewards')}
      onPlay={() => navigation.navigate('LevelSelect')}
      onSettings={() => navigation.navigate('Settings')}
    />
  );
}

function renderGameTabBar(props) {
  return <GameTabBar {...props} />;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      backBehavior="history"
      initialRouteName="Home"
      screenOptions={{headerShown: false}}
      tabBar={renderGameTabBar}>
      <Tab.Screen name="CheckIn" component={CheckInScreen} options={{tabBarLabel: 'Check-In'}} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
        <Stack.Screen name="Gameplay" component={GameplayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
