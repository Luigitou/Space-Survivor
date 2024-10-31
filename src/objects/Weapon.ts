import { WeaponConfig, WeaponConfigType } from '~/config';
import { PlayerProjectile } from '~/objects/PlayerProjectiles';

export class Weapon {
  private readonly scene: Phaser.Scene;
  private readonly name: string;
  private readonly weaponConfig: WeaponConfigType;
  private currentAmmo: number;
  private canShoot: boolean = true;

  public constructor(scene: Phaser.Scene, name: string) {
    this.weaponConfig = WeaponConfig[name];
    this.name = name;
    this.scene = scene;
    this.currentAmmo = this.weaponConfig.ammo;
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
    this.canShoot = false;
    this.scene.time.delayedCall(this.weaponConfig.reloadTime, () => {
      this.currentAmmo = this.weaponConfig.ammo;
      this.canShoot = true;
    });
  }

  public getFireRate(): number {
    return this.weaponConfig.rate;
  }
}
