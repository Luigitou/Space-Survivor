import { WeaponConfig, WeaponConfigType } from '~/config';
import { PlayerProjectile } from '~/objects/PlayerProjectiles';

export class Weapon {
  private readonly scene: Phaser.Scene;
  private readonly name: string;
  private readonly weaponConfig: WeaponConfigType;
  private currentAmmo: number;
  private canShoot: boolean = true;
  private reloadBar: Phaser.GameObjects.Graphics;
  private reloadBarWidth: number = 50;
  private reloadBarHeight: number = 8;
  private crosshair: Phaser.GameObjects.Sprite;

  public constructor(
    scene: Phaser.Scene,
    name: string,
    crosshair: Phaser.GameObjects.Sprite
  ) {
    this.weaponConfig = WeaponConfig[name];
    this.name = name;
    this.scene = scene;
    this.currentAmmo = this.weaponConfig.ammo;
    this.crosshair = crosshair;

    this.reloadBar = scene.add.graphics();
    this.reloadBar.setDepth(1000);
  }

  public shoot(target: Phaser.Physics.Matter.Sprite) {
    console.log('current ammo:', this.currentAmmo);
    if (this.canShoot && this.currentAmmo > 0) {
      new PlayerProjectile(
        this.scene,
        target.x,
        target.y,
        this.weaponConfig.damage
      );
      this.currentAmmo--;
      if (this.currentAmmo === 0) {
        this.reload();
      }
    }
  }

  public reload() {
    this.currentAmmo = 0;
    this.canShoot = false;
    this.crosshair.setAlpha(0.5);
    this.startReloadBar();
    this.scene.time.delayedCall(this.weaponConfig.reloadTime, () => {
      this.currentAmmo = this.weaponConfig.ammo;
      this.canShoot = true;
      this.reloadBar.clear();
      this.crosshair.setAlpha(1);
    });
  }

  public getFireRate(): number {
    return this.weaponConfig.rate;
  }

  public getMaxAmmo(): number {
    return this.weaponConfig.ammo;
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  private startReloadBar() {
    const reloadTime = this.weaponConfig.reloadTime;

    let reloadProgress = 0;
    this.scene.time.addEvent({
      delay: reloadTime / 100,
      repeat: 100,
      callback: () => {
        reloadProgress += 0.01;
        this.updateReloadBar(reloadProgress);

        if (reloadProgress >= 1) {
          this.reloadBar.clear();
        }
      },
    });
  }

  private updateReloadBar(progress: number) {
    this.reloadBar.clear();
    this.reloadBar.fillStyle(0xffffff, 1);
    const barWidth = this.reloadBarWidth * progress;

    const crosshairX = this.scene.input.activePointer.worldX;
    const crosshairY = this.scene.input.activePointer.worldY;

    this.reloadBar.fillRect(
      crosshairX - this.reloadBarWidth / 2,
      crosshairY + 20,
      barWidth,
      this.reloadBarHeight
    );
  }
}
