import Phaser from 'phaser';

export class CharacterEntity extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'charac-entity-down');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.displayWidth = 64;
    this.displayHeight = 64;
    this.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard?.createCursorKeys();
  }

  update() {
    const speed = 200;
    if (this.cursors?.left?.isDown) {
      this.anims.play('walk-left', true);
      this.setVelocityX(-speed);
    } else if (this.cursors?.right?.isDown) {
      this.anims.play('walk-right', true);
      this.setVelocityX(speed);
    } else if (this.cursors?.up?.isDown) {
      this.setVelocityX(0);
    } else if (this.cursors?.down?.isDown) {
      this.setVelocityX(0);
    } else {
      this.setVelocityX(0);
    }

    if (this.cursors?.up?.isDown && this.cursors?.left?.isDown) {
      this.anims.play('walk-up', true);
      this.setVelocityX(-speed);
      this.setVelocityY(-speed);
    } else if (this.cursors?.up?.isDown && this.cursors?.right?.isDown) {
      this.anims.play('walk-up', true);
      this.setVelocityX(speed);
      this.setVelocityY(-speed);
    } else if (this.cursors?.down?.isDown && this.cursors?.left?.isDown) {
      this.anims.play('walk-down', true);
      this.setVelocityX(-speed);
      this.setVelocityY(speed);
    } else if (this.cursors?.down?.isDown && this.cursors?.right?.isDown) {
      this.anims.play('walk-down', true);
      this.setVelocityX(speed);
      this.setVelocity;
    } else {
      this.setVelocityY(0);
    }

    if (this.cursors?.up?.isDown) {
      this.anims.play('walk-up', true);
      this.setVelocityY(-speed);
    } else if (this.cursors?.down?.isDown) {
      this.anims.play('walk-down', true);
      this.setVelocityY(speed);
    } else {
      this.setVelocityY(0);
    }

    if (
      !this.cursors?.left?.isDown &&
      !this.cursors?.right?.isDown &&
      !this.cursors?.up?.isDown &&
      !this.cursors?.down?.isDown
    ) {
      this.anims.stop();
    }
  }
}
