import { BasicEnemy } from '~/objects';
import { CaCEnemyConfig } from '~/config';
import { VectorField } from '~/utils';

export class CaCEnemy extends BasicEnemy {
  private canAttack: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    vectorField: VectorField
  ) {
    super(scene, x, y, vectorField);
  }

  public update(enemies: BasicEnemy[]) {
    if (
      Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.y) <
        CaCEnemyConfig.attackRange &&
      this.canAttack
    ) {
      this.performAttack();
    } else {
      super.update(enemies);
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
