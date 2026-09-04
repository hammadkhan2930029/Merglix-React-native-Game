import {useCallback, useEffect, useRef} from 'react';
import {Image, Platform, Vibration} from 'react-native';
import Sound from 'react-native-sound';
import {useGameProgress} from '../context/GameProgressContext';

const SOURCES = {
  move: require('../assets/soundEffects/pickup.mp3'),
  match: require('../assets/soundEffects/coin.mp3'),
  complete: require('../assets/soundEffects/level-up.mp3'),
  click: require('../assets/soundEffects/btnClick1.mp3'),
};

// Metro exposes URLs in debug, while Android release packages these as raw
// resources. Using their packaged identifiers avoids treating audio as images.
const ANDROID_RELEASE_SOURCES = {
  move: 'src_assets_soundeffects_pickup',
  match: 'src_assets_soundeffects_coin',
  complete: 'src_assets_soundeffects_levelup',
  click: 'src_assets_soundeffects_btnclick1',
};

export default function useGameSounds() {
  const {settings} = useGameProgress();
  const sounds = useRef({});
  const pending = useRef(new Set());

  useEffect(() => {
    const pendingSounds = pending.current;
    Sound.setCategory('Playback');
    Object.entries(SOURCES).forEach(([key, source]) => {
      const uri =
        Platform.OS === 'android' && !__DEV__
          ? ANDROID_RELEASE_SOURCES[key]
          : Image.resolveAssetSource(source)?.uri;
      if (!uri) {
        return;
      }

      const sound = new Sound(uri, '', error => {
        if (error) {
          delete sounds.current[key];
          console.warn(`Unable to load ${key} sound`, error);
          return;
        }

        const loadedSound = sounds.current[key];
        loadedSound?.setVolume(1);
        if (pendingSounds.has(key)) {
          pendingSounds.delete(key);
          loadedSound?.play();
        }
      });
      sounds.current[key] = sound;
    });

    return () => {
      Object.values(sounds.current).forEach(sound => sound?.release());
      sounds.current = {};
      pendingSounds.clear();
    };
  }, []);

  return useCallback(name => {
    if (settings.vibration) {
      if (name === 'match') Vibration.vibrate(35);
      if (name === 'complete') Vibration.vibrate([0, 60, 55, 90]);
    }
    if (!settings.sound) return;

    const sound = sounds.current[name];
    if (!sound?.isLoaded()) {
      pending.current.add(name);
      return;
    }

    if (sound.isPlaying()) {
      sound.stop(() => sound.play());
    } else {
      sound.play();
    }
  }, [settings.sound, settings.vibration]);
}
