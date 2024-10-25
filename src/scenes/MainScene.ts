import Phaser from 'phaser';
import { CharacterEntity } from '~/objects/character/entity/CharacterEntity';
import {
  loadCharacterAnimations,
  createCharacterAnimations,
} from '~/animations/characterAnimations';
import ProjectileSound from '~/audio/blaster.mp3';
import ProjectileLaser from '~/assets/sprites/effects/bullets/ProjectileLaser.gif';

export class MainScene extends Phaser.Scene {
  private readonly mapWidth = 2000;
  private readonly mapHeight = 2000;
  private player!: CharacterEntity;
  private leftMouseDown: boolean = false;
  private lastShotTime?: number;

  constructor() {
    super('MainScene');
  }

  preload() {
    loadCharacterAnimations(this);
    this.load.audio('shoot-sound', ProjectileSound);
    this.load.image('space-background', 'assets/game-background.jpg');
    this.load.spritesheet('projectile-laser', ProjectileLaser, {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.leftMouseDown = true;
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased()) {
        this.leftMouseDown = false;
      }
    });
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

    if (this.leftMouseDown) {
      if (!this.lastShotTime || this.time.now - this.lastShotTime > 500) {
        this.shoot();
        this.lastShotTime = this.time.now;
      }
    }
  }

  shoot() {
    const projectile = this.physics.add.sprite(
      this.player.x,
      this.player.y,
      'projectile-laser'
    );

    projectile.setCollideWorldBounds(true);
    projectile.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === projectile) {
        projectile.destroy();
      }
    });

    this.physics.moveTo(
      projectile,
      this.input.activePointer.worldX,
      this.input.activePointer.worldY,
      400
    );

    // Play shooting sound
    this.sound.play('shoot-sound');

    projectile.setCollideWorldBounds(true);
    projectile.on('worldbounds', () => {
      projectile.destroy();
    });
  }
}
