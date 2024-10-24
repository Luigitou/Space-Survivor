import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private readonly mapWidth = 2000;
  private readonly mapHeight = 2000;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('space-background', 'assets/game-background.jpg');
  }

  create() {
    this.updateWorldBounds();

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

    this.scale.on('resize', this.resize, this);
  }

  updateWorldBounds() {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
  }

  resize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.physics.world.setBounds(0, 0, width, height);
  }
}
