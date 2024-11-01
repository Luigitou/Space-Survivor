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
    this.health = value;
  }

  private set Damage(value: number) {
    this.damage = value;
  }

  private set Speed(value: number) {
    this.speed = value;
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
    this.Health -= damage;
    if (this.Health <= 0 && !PlayerConfig.godMode) {
      console.log('Player is dead');
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
