class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.loadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio system initialization failed:', error);
    }
  }

  async loadSounds() {
    const soundDefinitions = {
      hover: { frequency: 800, type: 'sine', duration: 0.1 },
      click: { frequency: 1200, type: 'triangle', duration: 0.05 },
      success: { frequency: 600, type: 'sine', duration: 0.2 },
      error: { frequency: 300, type: 'square', duration: 0.3 },
      swipe: { frequency: 1000, type: 'sawtooth', duration: 0.15 },
      notification: { frequency: 880, type: 'sine', duration: 0.25 }
    };

    for (const [name, config] of Object.entries(soundDefinitions)) {
      this.sounds[name] = config;
    }
  }

  playSound(soundName, volume = 0.3) {
    if (!this.initialized || !this.audioContext) return;

    const sound = this.sounds[soundName];
    if (!sound) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
    oscillator.type = sound.type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + sound.duration);
  }

  playSequence(notes, interval = 100) {
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playSound(note);
      }, index * interval);
    });
  }

  // Futuristic sound effects
  playDataProcessing() {
    const frequencies = [400, 500, 600, 700, 800];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 0.1, 0.1);
      }, index * 50);
    });
  }

  createTone(frequency, duration, volume) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

export const audioSystem = new AudioSystem();
