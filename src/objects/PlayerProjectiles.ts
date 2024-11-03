import { ProjectileConfig } from '~/config';
import { PlayerShootConfig } from '~/config/player.config';
import { BasicEnemy } from '~/objects/BasicEnemy';
import { Weapon } from '~/objects/Weapon';

export class PlayerProjectile extends Phaser.Physics.Matter.Sprite {
  private readonly damage: number;
  private readonly buffEffects!: string[];
  private readonly weapon!: Weapon;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number,
    weapon: Weapon
  ) {
    super(scene.matter.world, x, y, 'playerLaser');
    scene.sound.play('laserSound');
    this.damage = damage;
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

    const speed = PlayerShootConfig.projectileSpeed;

    const pointer = scene.input.activePointer;
    const target = { x: pointer.worldX, y: pointer.worldY };

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.rotation = angle;

    this.setOnCollide(this.handleCollision.bind(this));
    this.weapon = weapon;
  }

  private handleCollision(
    event: Phaser.Types.Physics.Matter.MatterCollisionData
  ) {
    const { bodyA, bodyB } = event;
    const otherBody = bodyA === this.body ? bodyB : bodyA;

    try {
      if (otherBody.gameObject) {
        this.processCollision(otherBody.gameObject);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private processCollision(targetObject: any) {
    if (targetObject instanceof BasicEnemy) {
      this.handleBasicEnemyCollision(targetObject);
    } else if (targetObject instanceof Phaser.Physics.Matter.TileBody) {
      this.destroy();
    }
  }

  private handleBasicEnemyCollision(targetObject: BasicEnemy) {
    if (!targetObject.scene) return;
    targetObject.takeDamage(this.damage);

    if (!this.weapon.getWeaponMods('piercingShots')) {
      this.destroy();
    }
  }
}
