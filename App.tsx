import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import BackgroundMusic from './src/components/BackgroundMusic';
import {GameProgressProvider} from './src/context/GameProgressContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(error => console.warn('Unable to initialize Mobile Ads', error));
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GameProgressProvider>
        <BackgroundMusic />
        {isLoading ? (
          <SplashScreen onLoadingComplete={() => setIsLoading(false)} />
        ) : (
          <AppNavigator />
        )}
      </GameProgressProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {flex: 1},
});
