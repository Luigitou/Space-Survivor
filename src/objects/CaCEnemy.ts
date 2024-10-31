import { BasicEnemy } from '~/objects';
import { CaCEnemyConfig } from '~/config';

export class CaCEnemy extends BasicEnemy {
  private canAttack: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  public update() {
    if (
      Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.y) <
        CaCEnemyConfig.attackRange &&
      this.canAttack
    ) {
      this.performAttack();
    } else {
      super.update();
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
