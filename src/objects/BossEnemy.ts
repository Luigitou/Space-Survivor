import { BasicEnemy, Projectile } from '~/objects';
import { BossEnemyConfig } from '~/config';

export class BossEnemy extends BasicEnemy {
  private canShoot: boolean = true;
  private currentPhase: number = 1;
  private bossHealthBar!: Phaser.GameObjects.Container;
  private healthBarWidth: number = 400;
  private healthBarHeight: number = 10;
  private projectileTimers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    this.setTexture('boss');
    this.health = BossEnemyConfig.health;
    this.xpCount = 15;
    this.createHealthBar();
  }

  public update() {
    if (this.checkAttackRange() && this.canShoot) {
      this.fireProjectiles();
    } else {
      super.update();
    }

    this.updateHealthBar();
  }

  public takeDamage(damage: number) {
    super.takeDamage(damage);

    if (this.health <= BossEnemyConfig.health * 0.3) {
      this.currentPhase = 3;
      this.startBlinking();
    } else if (this.health <= BossEnemyConfig.health * 0.6) {
      this.currentPhase = 2;
    }
  }

  public destroy(fromScene?: boolean) {
    this.scene?.tweens.killTweensOf(this);
    this.bossHealthBar.destroy();
    super.destroy(fromScene);
  }

  private createHealthBar() {
    const screenCenterX = this.scene.cameras.main.width / 2;

    this.bossHealthBar = this.scene.add.container(screenCenterX, 30);
    this.bossHealthBar.setScrollFactor(0);

    // Texte "BOSS" avec contour noir
    const bossText = this.scene.add.text(0, -5, 'BOSS', {
      fontSize: '24px',
      color: '#e6e6e6', // Blanc cassé pour un look spatial
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4,
    });
    bossText.setOrigin(0.5, 0.8);

    // Fond de la barre de vie avec bordure plus visible
    const background = this.scene.add.graphics();
    background.lineStyle(2, 0x000000, 1); // Contour noir
    background.fillStyle(0x1a1a1a, 0.9); // Fond très sombre
    background.fillRoundedRect(
      -this.healthBarWidth / 2,
      0,
      this.healthBarWidth,
      this.healthBarHeight,
      5
    );
    background.strokeRoundedRect(
      -this.healthBarWidth / 2,
      0,
      this.healthBarWidth,
      this.healthBarHeight,
      5
    );

    // Barre de vie
    const healthBar = this.scene.add.graphics();
    healthBar.fillStyle(0xff0000, 1);
    healthBar.fillRoundedRect(
      -this.healthBarWidth / 2,
      0,
      this.healthBarWidth,
      this.healthBarHeight,
      5
    );

    this.bossHealthBar.add([background, healthBar, bossText]);
    this.bossHealthBar.setDepth(1000);
  }

  private updateHealthBar() {
    const healthPercentage = this.health / BossEnemyConfig.health;
    const healthBar = this.bossHealthBar.getAt(
      1
    ) as Phaser.GameObjects.Graphics;

    healthBar.clear();
    healthBar.fillStyle(0xff3333, 1);
    healthBar.fillRoundedRect(
      -this.healthBarWidth / 2,
      0,
      this.healthBarWidth * healthPercentage,
      this.healthBarHeight,
      5
    );

    // Ajout d'une brillance sur le dessus pour un effet subtil
    healthBar.lineStyle(1, 0xffffff, 0.3);
    healthBar.beginPath();
    healthBar.moveTo(-this.healthBarWidth / 2, 1);
    healthBar.lineTo(
      -this.healthBarWidth / 2 + this.healthBarWidth * healthPercentage,
      1
    );
    healthBar.strokePath();
  }

  private checkAttackRange(): boolean {
    if (!this.target) return false;
    return (
      Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.target.x,
        this.target.y
      ) < BossEnemyConfig.attackRange
    );
  }

  private fireProjectiles() {
    switch (this.currentPhase) {
      case 1:
        this.fireTripleProjectiles();
        break;
      case 2:
        this.fireTripleAngleProjectiles();
        break;
      case 3:
        this.fireCircularProjectiles();
        break;
    }

    this.canShoot = false;
    const timer = this.scene.time.delayedCall(
      BossEnemyConfig.attackRate,
      () => {
        if (this.scene) {
          this.canShoot = true;
        }
      }
    );
    this.projectileTimers.push(timer);
  }

  private fireTripleProjectiles() {
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    for (let shotIndex = 0; shotIndex < 3; shotIndex++) {
      const timer = this.scene.time.delayedCall(shotIndex * 200, () => {
        if (this.scene) {
          for (let i = 0; i < 3; i++) {
            const distance = 50 + i * 50;
            const projectile = new Projectile(this.scene, this.x, this.y, {
              x: this.x + Math.cos(angle) * distance,
              y: this.y + Math.sin(angle) * distance,
            });
            projectile.setTint(0x00ff00);
          }
        }
      });
      this.projectileTimers.push(timer);
    }
  }

  private fireTripleAngleProjectiles() {
    const baseAngle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    for (let shotIndex = 0; shotIndex < 3; shotIndex++) {
      const timer = this.scene.time.delayedCall(shotIndex * 200, () => {
        if (this.scene) {
          const angleGroups = [-30, 0, 30];
          angleGroups.forEach((groupAngle) => {
            const finalAngle = baseAngle + Phaser.Math.DegToRad(groupAngle);
            for (let i = 0; i < 3; i++) {
              const distance = 50 + i * 50;
              const projectile = new Projectile(this.scene, this.x, this.y, {
                x: this.x + Math.cos(finalAngle) * distance,
                y: this.y + Math.sin(finalAngle) * distance,
              });
              projectile.setTint(0x00ff00);
            }
          });
        }
      });
      this.projectileTimers.push(timer);
    }
  }

  private fireCircularProjectiles() {
    for (let shotIndex = 0; shotIndex < 3; shotIndex++) {
      const timer = this.scene.time.delayedCall(shotIndex * 200, () => {
        const baseAngle = this.scene.time.now * 0.01;
        const angleOffset = (shotIndex * Math.PI) / 12;

        for (let i = 0; i < 12; i++) {
          const angle = baseAngle + angleOffset + (i * Math.PI * 2) / 12;
          for (let j = 0; j < 3; j++) {
            const distance = 50 + j * 50;
            const projectile = new Projectile(this.scene, this.x, this.y, {
              x: this.x + Math.cos(angle) * distance,
              y: this.y + Math.sin(angle) * distance,
            });
            projectile.setTint(0x00ff00);
          }
        }
      });
      this.projectileTimers.push(timer);
    }
  }

  private startBlinking() {
    if (!this.scene) return;

    this.scene.tweens.killTweensOf(this);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
      onUpdate: () => {
        this.setTint(0xff0000);
      },
      onYoyo: () => {
        this.clearTint();
      },
    });
  }
}
