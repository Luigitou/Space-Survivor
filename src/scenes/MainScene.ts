import Phaser from 'phaser';
import { CharacterEntity } from '~/objects/CharacterEntity';
import {
  loadCharacterAnimations,
  createCharacterAnimations,
} from '~/animations/characterAnimations';

export class MainScene extends Phaser.Scene {
  private readonly mapWidth = 2000;
  private readonly mapHeight = 2000;
  private player!: CharacterEntity;

  constructor() {
    super('MainScene');
  }

  preload() {
    loadCharacterAnimations(this);
    this.load.image('space-background', 'assets/game-background.jpg');
  }

  create() {
    createCharacterAnimations(this);

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

    this.player = new CharacterEntity(
      this,
      this.mapWidth / 2,
      this.mapHeight / 2
    );
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    this.player.update();
  }
}
