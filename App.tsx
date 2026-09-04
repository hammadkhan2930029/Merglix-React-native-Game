import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <GestureHandlerRootView style={styles.root}>
      {isLoading ? (
        <SplashScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <AppNavigator />
      )}
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {flex: 1},
});
