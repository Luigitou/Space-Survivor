import Phaser from 'phaser';

export class CustomScene extends Phaser.Scene {
  public hudContainer!: Phaser.GameObjects.Container;

  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  create() {
    // Initialize the hudContainer
    this.hudContainer = this.add.container(0, 0);
  }
}
