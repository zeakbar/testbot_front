import { Howl } from 'howler';

// Sound effect paths - put your audio files in public/sounds/
// Free sound resources: Freesound.org, Pixabay, Zapsplat
const SOUNDS = {
  correct: '/sounds/correct.mp3',      // Success/correct answer sound
  incorrect: '/sounds/incorrect.mp3',  // Error/incorrect answer sound
  complete: '/sounds/complete.mp3',    // Test completion sound
};

class SoundSystem {
  private sounds: Record<string, Howl> = {};
  private enabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    Object.entries(SOUNDS).forEach(([key, path]) => {
      this.sounds[key] = new Howl({
        src: [path],
        volume: 0.5,
        onloaderror: (_id: unknown, error: unknown) => {
          console.warn(`Failed to load sound: ${key}`, error);
        },
      });
    });
  }

  play(soundKey: keyof typeof SOUNDS) {
    if (!this.enabled) return;
    try {
      this.sounds[soundKey]?.play();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundKey}`, error);
    }
  }

  setVolume(volume: number) {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume(Math.max(0, Math.min(1, volume)));
    });
  }

  toggleMute(enabled: boolean) {
    this.enabled = enabled;
  }

  isMuted() {
    return !this.enabled;
  }
}

export const soundSystem = new SoundSystem();
