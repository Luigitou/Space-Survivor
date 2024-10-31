import { ProjectileConfig } from '~/config';
import { PlaceyerShootConfig } from '~/config/player.config';
import { BasicEnemy } from '~/objects/BasicEnemy';

export class PlayerProjectile extends Phaser.Physics.Matter.Sprite {
  private readonly damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number) {
    super(scene.matter.world, x, y, 'playerLaser');
    scene.sound.play('laserSound');

    this.damage = damage;

    scene.add.existing(this);
    this.setDisplaySize(
      ProjectileConfig.displaySize,
      ProjectileConfig.displaySize
    );
    this.setRectangle(ProjectileConfig.hitboxSize, ProjectileConfig.hitboxSize);
    this.setFrictionAir(0);
    this.setFixedRotation();
    this.setSensor(true);

    const speed = PlaceyerShootConfig.projectileSpeed;

    // Get the target position baseed on the mouse pointer
    const pointer = scene.input.activePointer;
    const target = { x: pointer.worldX, y: pointer.worldY };

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

        if (targetObject instanceof BasicEnemy) {
          if (!targetObject.scene) return;
          targetObject.takeDamage(this.damage);
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
