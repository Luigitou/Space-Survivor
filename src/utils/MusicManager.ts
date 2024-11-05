import { AudioConfig } from '~/config/audio.config';

export class MusicManager {
  private static instance: MusicManager;
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentScene?: string;

  private constructor() {}

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  public preloadSceneMusic(scene: Phaser.Scene): void {
    const sceneKey = scene.scene.key;
    const musicConfig =
      AudioConfig.scenes[sceneKey as keyof typeof AudioConfig.scenes]?.music;

    if (musicConfig) {
      scene.load.audio(musicConfig.key, musicConfig.path);
    }
  }

  public playSceneMusic(scene: Phaser.Scene): void {
    const sceneKey = scene.scene.key;
    const musicConfig =
      AudioConfig.scenes[sceneKey as keyof typeof AudioConfig.scenes]?.music;

    if (this.currentScene === sceneKey) return;

    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = undefined;
    }

    if (musicConfig) {
      this.currentMusic = scene.sound.add(musicConfig.key, musicConfig.config);
      this.currentMusic.play();
      this.currentScene = sceneKey;
    }
  }

  public stopCurrentMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = undefined;
      this.currentScene = undefined;
    }
  }
}
