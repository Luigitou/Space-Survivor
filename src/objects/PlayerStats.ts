import { PlayerConfig } from '~/config/player.config';
import { playerBuffConfig } from '~/config';
import { playerBuffConfigType } from '~/config';
export class PlayerStats extends Phaser.Physics.Matter.Sprite {
  private health: number;
  private speed: number;

  public currentStatLevels: { [key: string]: number };
  public maxStatLevels: { [key: string]: number };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, '');
    this.scene = scene;

    this.health = PlayerConfig.baseHealth;
    this.speed = PlayerConfig.baseSpeed;

    // Initialisation des niveaux de statistiques actuels
    this.currentStatLevels = {};
    for (const key in playerBuffConfig) {
      this.currentStatLevels[key] = 0;
    }

    // Initialisation des niveaux de statistiques max
    this.maxStatLevels = {};
    for (const key in playerBuffConfig) {
      this.maxStatLevels[key] = playerBuffConfig[key].maxLevel;
    }
  }

  public get Health(): number {
    return this.health;
  }

  public get Speed(): number {
    return this.speed;
  }

  private set Health(value: number) {
    console.log(`Santé modifiée : ${this.health} -> ${value}`);
    console.trace('Stack trace de la modification de santé:');
    this.health = value;
  }

  private set Speed(value: number) {
    this.speed = value;
  }

  public get MaxHealth(): number {
    return PlayerConfig.baseHealth;
  }
  public get HealthPercentage(): number {
    return Math.min(Math.max((this.health / this.MaxHealth) * 100, 0), 100);
  }

  public buffStats(buff: playerBuffConfigType) {
    const buffName = buff.name;
    if (this.currentStatLevels[buffName] < this.maxStatLevels[buffName]) {
      const statType = buff.type;
      this[statType] += this[statType] * buff.buffPercent;
      this.currentStatLevels[buffName]++;
      console.log(
        `${buffName.charAt(0).toUpperCase() + buffName.slice(1)}: ${this[statType]}`
      );
      console.log(
        `Current level of ${buffName}: ${this.currentStatLevels[buffName]}`
      );
    }
  }

  public isStatAlreadyMaxed(stat: string): boolean {
    return this.currentStatLevels[stat] >= this.maxStatLevels[stat];
  }

  public applyDamage(damage: number) {
    if (!PlayerConfig.godMode) {
      console.log(`Dégâts reçus : ${damage}`);
      console.trace('Source des dégâts:');
      this.Health -= damage;
      if (this.Health <= 0) {
        console.log('Player is dead');
        this.setActive(false);
        this.setVisible(false);
      }
    }
  }

  public setHealth(value: number): void {
    this.health = Math.min(Math.max(value, 0), this.MaxHealth);
  }
}
