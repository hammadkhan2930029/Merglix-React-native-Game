import { useEffect, useRef } from 'react';
import { AppState, Image, Platform } from 'react-native';
import Sound from 'react-native-sound';
import { useGameProgress } from '../context/GameProgressContext';

const MUSIC_SOURCE = require('../assets/soundEffects/merglix_background_music.mp3');
const ANDROID_SOURCE = 'asset:/merglix_background_music.mp3';
const MUSIC_VOLUME = 0.18;

function canPlayInAppState(state) {
  // React Native can report null briefly during a cold start. The JS bundle is
  // already active at that point, so blocking null prevents splash music from
  // ever receiving its initial play call on some Android devices.
  return state !== 'background' && state !== 'inactive';
}

export default function BackgroundMusic() {
  const { isRewardedAdShowing, settings } = useGameProgress();
  const music = useRef(null);
  const appState = useRef(AppState.currentState);
  const musicEnabled = useRef(settings.music);
  const adShowing = useRef(isRewardedAdShowing);
  const startPlayback = useRef(null);

  useEffect(() => {
    musicEnabled.current = settings.music;
    adShowing.current = isRewardedAdShowing;

    if (settings.music && !isRewardedAdShowing) {
      startPlayback.current?.();
    } else {
      music.current?.pause();
    }
  }, [isRewardedAdShowing, settings.music]);

  useEffect(() => {
    Sound.setCategory('Playback', true);

    const uri =
      Platform.OS === 'android'
        ? ANDROID_SOURCE
        : Image.resolveAssetSource(MUSIC_SOURCE)?.uri;

    if (!uri) {
      console.warn('Unable to resolve Merglix background music');
      return undefined;
    }

    const track = new Sound(uri, '', error => {
      if (error) {
        console.warn('Unable to load Merglix background music', error);
        return;
      }

      track.setVolume(MUSIC_VOLUME);
      track.setNumberOfLoops(-1);
      startPlayback.current?.();
    });
    music.current = track;
    startPlayback.current = () => {
      if (
        !musicEnabled.current ||
        adShowing.current ||
        !canPlayInAppState(appState.current) ||
        !track.isLoaded() ||
        track.isPlaying()
      ) {
        return;
      }

      track.play(success => {
        if (!success) {
          console.warn('Merglix background music playback failed');
        }
      });
    };

    const subscription = AppState.addEventListener('change', nextState => {
      appState.current = nextState;
      if (!track.isLoaded()) {
        return;
      }

      if (canPlayInAppState(nextState) && musicEnabled.current) {
        startPlayback.current?.();
      } else {
        track.pause();
      }
    });

    return () => {
      subscription.remove();
      startPlayback.current = null;
      track.stop(() => track.release());
      music.current = null;
    };
  }, []);

  return null;
}
