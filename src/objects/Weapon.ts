import { WeaponConfig, WeaponConfigType } from '~/config';
import { PlayerProjectile } from '~/objects/PlayerProjectiles';
import { weaponsBuffConfig, weaponsBuffConfigType } from '~/config/buff.config';
interface weaponMods {
  [key: string]: boolean;
}
export class Weapon {
  private readonly scene: Phaser.Scene;
  private readonly name: string;
  private readonly weaponConfig: WeaponConfigType;
  private currentAmmo: number;
  private fireRate: number;
  private damage: number;
  private canShoot: boolean = true;
  private reloadBar: Phaser.GameObjects.Graphics;
  private reloadBarWidth: number = 50;
  private reloadBarHeight: number = 8;
  private crosshair: Phaser.GameObjects.Sprite;
  public currentStatLevels: { [key: string]: number };
  public maxStatLevels: { [key: string]: number };

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
    this.fireRate = this.weaponConfig.rate;
    this.damage = this.weaponConfig.damage;

    // Initialisation des niveaux de statistiques actuels
    this.currentStatLevels = {};
    for (const key in weaponsBuffConfig) {
      this.currentStatLevels[key] = 0;
    }
    // Initialisation des niveaux de statistiques max
    this.maxStatLevels = {};
    for (const key in weaponsBuffConfig) {
      this.maxStatLevels[key] = weaponsBuffConfig[key].maxLevel;
    }
  }

  private weaponMods: weaponMods = {
    infiniteAmmo: false,
    burstFire: false,
    piercingShots: false,
  };

  public getWeaponMods(...modName: string[]): boolean | weaponMods {
    if (modName.length > 0) {
      const mods: weaponMods = {};
      modName.forEach((mod) => {
        mods[mod] = this.weaponMods[mod];
      });
      return this.weaponMods[modName[0]];
    } else {
      return this.weaponMods;
    }
  }

  public setWeaponMods(mod: string, value: boolean) {
    this.weaponMods[mod] = value;
  }

  public shoot(target: Phaser.Physics.Matter.Sprite) {
    console.log('current ammo:', this.currentAmmo);
    const weaponMods = this.getWeaponMods();
    if ((weaponMods as weaponMods).burstFire) {
      if (this.canShoot && this.currentAmmo > 0) {
        for (let i = 0; i < 3; i++) {
          this.scene.time.delayedCall(100 * i, () => {
            new PlayerProjectile(
              this.scene,
              target.x,
              target.y,
              this.weaponConfig.damage,
              this
            );
            this.currentAmmo--;
            if (this.currentAmmo === 0) {
              this.reload();
            }
          });
        }
      }
    } else if ((weaponMods as weaponMods).infiniteAmmo) {
      new PlayerProjectile(
        this.scene,
        target.x,
        target.y,
        this.weaponConfig.damage,
        this
      );
    } else {
      console.log('current ammo:', this.currentAmmo);
      if (this.canShoot && this.currentAmmo > 0) {
        new PlayerProjectile(
          this.scene,
          target.x,
          target.y,
          this.weaponConfig.damage,
          this
        );
        this.currentAmmo--;
        if (this.currentAmmo === 0) {
          this.reload();
        }
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

  private setDamage(damage: number) {
    this.damage = damage;
  }

  public getDamage(): number {
    return this.damage;
  }

  public setFireRate(rate: number) {
    this.fireRate = rate;
  }

  public getFireRate(): number {
    return this.fireRate;
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

  public applyWeaponBuffStats(buff: weaponsBuffConfigType) {
    const buffName = buff.name;
    if (this.currentStatLevels[buffName] < this.maxStatLevels[buffName]) {
      const statType = buff.type;
      this[statType] += this[statType] * buff.buffPercent;
      this.currentStatLevels[buffName]++;
    }
  }

  public addMod(mod: weaponsBuffConfigType) {
    const modName = mod.name;
    const modType = mod.type;
    if (mod.buffPercent !== 0) {
      this[modType] += this[modType] * mod.buffPercent;
      console.log(
        `${modName.charAt(0).toUpperCase() + modName.slice(1)}: ${this[modType]}`
      );
    } else {
      this.applyMod(mod.effects);
    }
  }

  private applyMod(buffEffect: string) {
    switch (buffEffect) {
      case 'infiniteammo':
        this.weaponMods['infiniteAmmo'] = true;
        this.fireRate *= 1.5;
        break;
      case 'burstfire':
        this.weaponMods['burstFire'] = true;
        this.fireRate *= 2;
        break;
      case 'piercingshots':
        this.weaponMods['piercingShots'] = true;
        this.fireRate *= 1.2;
        break;
    }
  }

  public destroy() {
    // Nettoyer la barre de rechargement
    this.reloadBar?.destroy();

    // Arrêter tous les événements en cours
    this.scene.time.removeAllEvents();

    // Réinitialiser les mods
    this.weaponMods = {
      infiniteAmmo: false,
      burstFire: false,
      piercingShots: false,
    };

    // Nettoyer les références
    this.currentStatLevels = {};
    this.maxStatLevels = {};
  }
}
