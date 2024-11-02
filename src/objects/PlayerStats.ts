import { PlayerConfig } from '~/config/player.config';
import { bootOfSwiftness, maxHealth, strongBullet } from '~/config/buff.config';

export class PlayerStats extends Phaser.Physics.Matter.Sprite {
  private health: number;
  private damage: number;
  private speed: number;
  private currentHealthStatLevel: number;
  private currentDamageStatLevel: number;
  private currentSpeedStatLevel: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, '');

    this.health = PlayerConfig.baseHealth;
    this.damage = PlayerConfig.baseDamage;
    this.speed = PlayerConfig.baseSpeed;
    this.currentHealthStatLevel = 0;
    this.currentDamageStatLevel = 0;
    this.currentSpeedStatLevel = 0;
  }

  public get Health(): number {
    return this.health;
  }

  public get Damage(): number {
    return this.damage;
  }

  public get Speed(): number {
    return this.speed;
  }

  private set Health(value: number) {
    console.log(`Santé modifiée : ${this.health} -> ${value}`);
    console.trace('Stack trace de la modification de santé:');
    this.health = value;
  }

  private set Damage(value: number) {
    this.damage = value;
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

  public buffStats(stats: {
    health?: number;
    damage?: number;
    speed?: number;
    fireRate?: number;
  }) {
    console.log(stats);
    if (
      stats.health !== undefined &&
      this.currentHealthStatLevel < maxHealth.maxLevel
    ) {
      this.Health += this.health * maxHealth.buffPercent;
      this.currentHealthStatLevel++;
    }
    if (
      stats.damage !== undefined &&
      this.currentDamageStatLevel < strongBullet.maxLevel
    ) {
      this.Damage += this.damage * strongBullet.buffPercent;
      this.currentDamageStatLevel++;
    }
    if (
      stats.speed !== undefined &&
      this.currentSpeedStatLevel < bootOfSwiftness.maxLevel
    ) {
      this.Speed += this.speed * bootOfSwiftness.buffPercent;
      this.currentSpeedStatLevel++;
    }
  }

  public applyDamage(damage: number) {
    console.log(`Dégâts reçus : ${damage}`);
    console.trace('Source des dégâts:');
    this.Health -= damage;
    if (this.Health <= 0 && !PlayerConfig.godMode) {
      console.log('Player is dead');
      this.setActive(false);
      this.setVisible(false);
    }
  }

  public setHealth(value: number): void {
    this.health = Math.min(Math.max(value, 0), this.MaxHealth);
  }
}
