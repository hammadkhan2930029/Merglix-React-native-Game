import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@merglix/game-progress';
const INITIAL_SETTINGS = {sound: true, music: true, vibration: true};
const INITIAL_PROGRESS = {coins: 0, level: 1, levelStars: {}, settings: INITIAL_SETTINGS};
const GameProgressContext = createContext(null);

export function GameProgressProvider({children}) {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (value) {
          const saved = JSON.parse(value);
          setProgress({...INITIAL_PROGRESS, ...saved, settings: {...INITIAL_SETTINGS, ...saved.settings}});
        }
      })
      .catch(() => {});
  }, []);

  const updateProgress = useCallback(updater => {
    setProgress(current => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addCoins = useCallback(
    amount => updateProgress(current => ({...current, coins: current.coins + amount})),
    [updateProgress],
  );

  const saveLevelStars = useCallback(
    (levelNumber, stars) =>
      updateProgress(current => ({
        ...current,
        levelStars: {
          ...current.levelStars,
          [levelNumber]: Math.max(current.levelStars?.[levelNumber] ?? 0, stars),
        },
      })),
    [updateProgress],
  );

  const updateSettings = useCallback(
    values => updateProgress(current => ({...current, settings: {...current.settings, ...values}})),
    [updateProgress],
  );

  return (
    <GameProgressContext.Provider value={{...progress, addCoins, saveLevelStars, updateProgress, updateSettings}}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress() {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgress must be used inside GameProgressProvider');
  }
  return context;
}
