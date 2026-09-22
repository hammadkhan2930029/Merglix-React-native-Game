import {useCallback, useEffect, useRef, useState} from 'react';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

export default function useRewardedCoinsAd(onEarned, onVisibilityChange) {
  const [status, setStatus] = useState('loading');
  const rewardedRef = useRef(null);
  const earnedRef = useRef(false);
  const reloadTimerRef = useRef(null);
  const onEarnedRef = useRef(onEarned);
  const onVisibilityChangeRef = useRef(onVisibilityChange);

  useEffect(() => {
    onEarnedRef.current = onEarned;
    onVisibilityChangeRef.current = onVisibilityChange;
  }, [onEarned, onVisibilityChange]);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedRef.current = rewarded;

    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setStatus('ready'),
    );
    const unsubscribeOpened = rewarded.addAdEventListener(
      AdEventType.OPENED,
      () => {
        setStatus('showing');
        onVisibilityChangeRef.current?.(true);
      },
    );
    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (earnedRef.current) return;
        earnedRef.current = true;
        setStatus('earned');
        onEarnedRef.current?.();
      },
    );
    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        onVisibilityChangeRef.current?.(false);
        if (earnedRef.current) {
          setStatus('earnedClosed');
          return;
        }
        setStatus('closed');
        reloadTimerRef.current = setTimeout(() => {
          setStatus('loading');
          rewarded.load();
        }, 1600);
      },
    );
    const unsubscribeError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      error => {
        onVisibilityChangeRef.current?.(false);
        console.warn('Rewarded test ad error', error);
        setStatus('error');
      },
    );

    rewarded.load();

    return () => {
      onVisibilityChangeRef.current?.(false);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      rewarded.removeAllListeners();
      rewardedRef.current = null;
    };
  }, []);

  const show = useCallback(async () => {
    const rewarded = rewardedRef.current;
    if (!rewarded) return;

    if (!rewarded.loaded) {
      setStatus('loading');
      rewarded.load();
      return;
    }

    try {
      earnedRef.current = false;
      setStatus('showing');
      onVisibilityChangeRef.current?.(true);
      await rewarded.show();
    } catch (error) {
      onVisibilityChangeRef.current?.(false);
      console.warn('Unable to show rewarded test ad', error);
      setStatus('error');
    }
  }, []);

  const retry = useCallback(() => {
    if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    earnedRef.current = false;
    setStatus('loading');
    rewardedRef.current?.load();
  }, []);

  return {retry, show, status};
}
