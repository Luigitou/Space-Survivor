import { PlayerConfig } from '~/config';

export class BasicEntity extends Phaser.Physics.Matter.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'basic-entity');

    scene.add.existing(this);

    this.setRectangle(PlayerConfig.size, PlayerConfig.size);
    this.setFixedRotation();

    this.setFrictionAir(PlayerConfig.airFriction);
    this.setBounce(PlayerConfig.bounce);
    this.setMass(PlayerConfig.mass);

    this.cursors = scene.input.keyboard?.createCursorKeys();
  }

  update() {
    const speed = PlayerConfig.baseSpeed;

    let velocity = {
      x: 0,
      y: 0,
    };

    if (this.cursors?.left?.isDown) {
      velocity.x = -speed;
    } else if (this.cursors?.right?.isDown) {
      velocity.x = speed;
    }

    if (this.cursors?.up?.isDown) {
      velocity.y = -speed;
    } else if (this.cursors?.down?.isDown) {
      velocity.y = speed;
    }

    this.setVelocity(velocity.x, velocity.y);
  }
}
