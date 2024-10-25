import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig } from '~/config';

export class Enemy extends Phaser.Physics.Matter.Sprite {
  private target!: BasicEntity;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.size, EnemyConfig.size);
    this.setRectangle(EnemyConfig.size, EnemyConfig.size);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  update() {
    this.moveToPlayer();
  }

  private moveToPlayer() {
    const speed = EnemyConfig.baseSpeed;
    const direction = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    this.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);
  }
}
