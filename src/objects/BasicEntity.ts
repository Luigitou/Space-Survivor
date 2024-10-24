export class BasicEntity extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'basic-entity');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.displayWidth = 50;
    this.displayHeight = 50;
    this.setTint(0xff0000);
    this.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard?.createCursorKeys();
  }

  update() {
    const speed = 200;

    if (this.cursors?.left?.isDown) {
      this.setVelocityX(-speed);
    } else if (this.cursors?.right?.isDown) {
      this.setVelocityX(speed);
    } else {
      this.setVelocityX(0);
    }

    if (this.cursors?.up?.isDown) {
      this.setVelocityY(-speed);
    } else if (this.cursors?.down?.isDown) {
      this.setVelocityY(speed);
    } else {
      this.setVelocityY(0);
    }
  }
}
