import { BasicEnemy, Projectile } from '~/objects';
import { EasyStarManager } from '~/utils';
import { RangeEnemyConfig } from '~/config';

export class RangeEnemy extends BasicEnemy {
  private canShoot: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  public update(easystarManager: EasyStarManager) {
    if (this.checkAttack() && this.hasLineOfSight() && this.canShoot) {
      this.fireProjectile();
    } else {
      super.update(easystarManager);
    }
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

  private hasLineOfSight() {
    return true;
  }

  private fireProjectile() {
    new Projectile(this.scene, this.x, this.y, this.target);
    this.canShoot = false;
    this.scene.time.delayedCall(RangeEnemyConfig.attackRate, () => {
      this.canShoot = true;
    });
  }
}
