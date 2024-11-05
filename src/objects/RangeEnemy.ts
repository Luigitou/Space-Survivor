import { BasicEnemy, Projectile } from '~/objects';
import { EnemyConfig, RangeEnemyConfig } from '~/config';

export class RangeEnemy extends BasicEnemy {
  private canShoot: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-range');
    this.setOrigin(0.5, 0.5);
    this.setDisplaySize(EnemyConfig.sizeSprite, EnemyConfig.sizeSprite);
    this.setCircle(EnemyConfig.sizeHitbox);
    this.setFixedRotation();
  }

  public update() {
    if (this.target) {
      if (this.target.x < this.x) {
        this.scaleX = -1;
      } else {
        this.scaleX = 1;
      }
    }

    if (this.checkAttack() && this.hasLineOfSight() && this.canShoot) {
      this.fireProjectile();
    } else if (this.checkIfRangeAttack()) {
      this.setVelocity(0, 0);
    } else {
      super.update();
    }
  }

  private checkIfRangeAttack() {
    if (!this.target) return;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    return (
      distance < RangeEnemyConfig.attackRange * 0.8 && this.hasLineOfSight()
    );
  }

  private checkAttack() {
    if (!this.target) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    if (distance < RangeEnemyConfig.attackRange) {
      return true;
    }
  }

  private fireProjectile() {
    new Projectile(this.scene, this.x, this.y, this.target);
    this.canShoot = false;
    this.scene.time.delayedCall(RangeEnemyConfig.attackRate, () => {
      this.canShoot = true;
    });
  }
}
