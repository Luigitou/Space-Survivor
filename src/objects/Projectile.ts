import { ProjectileConfig, RangeEnemyConfig } from '~/config';
import { BasicEntity } from '~/objects/BasicEntity';

export class Projectile extends Phaser.Physics.Matter.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: { x: number; y: number }
  ) {
    super(scene.matter.world, x, y, 'enemyLaser');

    scene.add.existing(this);
    this.setDisplaySize(
      ProjectileConfig.displaySize,
      ProjectileConfig.displaySize
    );
    this.setRectangle(ProjectileConfig.hitboxSize, ProjectileConfig.hitboxSize);
    this.setFrictionAir(0);
    this.setFixedRotation();
    this.setSensor(true);

    const speed = RangeEnemyConfig.projectileSpeed;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.rotation = angle;

    this.setOnCollide(this.handleCollision.bind(this));
  }

  private handleCollision(
    event: Phaser.Types.Physics.Matter.MatterCollisionData
  ) {
    const { bodyA, bodyB } = event;
    const otherBody = bodyA === this.body ? bodyB : bodyA;

    try {
      if (otherBody.gameObject) {
        const targetObject = otherBody.gameObject;

        if (targetObject instanceof BasicEntity) {
          if (!targetObject.scene) return;
          targetObject.takeDamage(1);
          this.destroy();
        } else if (targetObject instanceof Phaser.Physics.Matter.TileBody) {
          this.destroy();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
