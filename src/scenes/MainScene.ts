import Phaser from 'phaser';
import { BasicEntity } from '~/objects';

export class MainScene extends Phaser.Scene {
  private readonly mapWidth = 2000;
  private readonly mapHeight = 2000;
  private player!: BasicEntity;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('space-background', 'assets/game-background.jpg');
  }

  create() {
    // ----- Creation de la map

    const imageWidth = 1920;
    const imageHeight = 1200;
    const spaceBackground = this.add.tileSprite(
      0,
      0,
      this.mapWidth,
      this.mapHeight,
      'space-background'
    );

    spaceBackground.setOrigin(0, 0);
    spaceBackground.tileScaleX = imageWidth / spaceBackground.width;
    spaceBackground.tileScaleY = imageHeight / spaceBackground.height;

    // ------ Création de la zone de jeu
    const playableArea = this.add.rectangle(
      100,
      100,
      this.mapWidth - 200,
      this.mapHeight - 200,
      0xffffff,
      0.1
    );

    playableArea.setOrigin(0, 0);
    this.physics.world.setBounds(
      playableArea.x,
      playableArea.y,
      playableArea.width,
      playableArea.height
    );

    // ----- Création du joueur
    this.player = new BasicEntity(this, this.mapWidth / 2, this.mapHeight / 2);

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    this.player.update();
  }
}
