import { BasicEnemy } from '~/objects';
import { CaCEnemyConfig } from '~/config';

export class CaCEnemy extends BasicEnemy {
  private canAttack: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-cac');
    this.setDisplaySize(64, 64);
    this.setFrame('Attack_01 0.png');
  }

  public update() {
    if (this.target) {
      if (this.target.x < this.x) {
        this.scaleX = -1;
      } else {
        this.scaleX = 1;
      }
    }

    if (
      Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.target.x,
        this.target.y
      ) < CaCEnemyConfig.attackRange &&
      this.canAttack
    ) {
      this.performAttack();
    } else {
      super.update();
    }
  }

  private performAttack() {
    this.canAttack = false;

    // Joue l'animation d'attaque
    this.play('cac-attack');

    // Applique les dégâts au joueur après un délai correspondant au moment de l'impact dans l'animation
    this.scene.time.delayedCall(300, () => {
      // Ajuste le délai selon ton animation
      this.target.takeDamage(1);
    });

    // Réactive l'attaque après le temps de recharge
    this.scene.time.delayedCall(CaCEnemyConfig.attackRate, () => {
      this.canAttack = true;
    });
  }
}
