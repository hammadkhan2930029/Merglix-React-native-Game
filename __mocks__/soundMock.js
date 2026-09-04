class SoundMock {
  static setCategory() {}

  constructor(_source, basePathOrCallback, onError) {
    const callback =
      typeof basePathOrCallback === 'function' ? basePathOrCallback : onError;
    callback?.(null);
  }

  isLoaded() {
    return true;
  }

  play() {}

  isPlaying() {
    return false;
  }

  setVolume() {
    return this;
  }

  stop(callback) {
    callback?.();
  }

  release() {}
}

module.exports = SoundMock;
