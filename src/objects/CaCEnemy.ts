import { BasicEnemy } from '~/objects';
import { CaCEnemyConfig } from '~/config';
import { EasyStarManager } from '~/utils';

export class CaCEnemy extends BasicEnemy {
  private canAttack: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  public update(easystarManager: EasyStarManager) {
    if (
      Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.y) <
        CaCEnemyConfig.attackRange &&
      this.canAttack
    ) {
      this.performAttack();
    } else {
      super.update(easystarManager);
    }
  }

  private performAttack() {
    this.canAttack = false;

    // Applique des dégâts au joueur
    this.target.takeDamage(1);

    // Réactive l'attaque après le temps de recharge
    this.scene.time.delayedCall(CaCEnemyConfig.attackRate, () => {
      this.canAttack = true;
    });
  }
}
