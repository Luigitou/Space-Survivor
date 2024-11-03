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

  cleanUp() {
    // Détruire le container HUD
    if (this.hudContainer) {
      this.hudContainer.destroy();
      this.hudContainer = this.add.container(0, 0);
    }
  }

  // Ajout de la méthode destroy
  protected destroy() {
    this.cleanUp();
    // Appel de la méthode destroy de la classe parente
    this.scene.stop(this.scene.key);
  }
}
