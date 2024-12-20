export const PlayerConfig = {
  minLevel: 1,
  maxLevel: 100,
  xpBarMinValue: 0,
  xpBarMaxValue: 100,
  baseHealth: 10,
  baseMaxHealth: 100,
  minHealth: 0,
  baseSpeed: 2.5,
  maxSpeed: 5,
  size: 32,
  bounce: 0,
  mass: 1,
  airFriction: 0.05,
  godMode: false,
  dodgeDuration: 200,
  dodgeCooldown: 1000,
};

export const PlayerShootConfig = {
  projectileSpeed: 10,
  attackRange: 300,
  attackRate: 1000,
};

export type WeaponConfigType = {
  name: string;
  damage: number;
  rate: number;
  ammo: number;
  reloadTime: number;
};

export const WeaponConfig: Record<string, WeaponConfigType> = {
  rifle: {
    name: 'rifle',
    damage: 2,
    rate: 200,
    ammo: 10,
    reloadTime: 1000,
  },
  machineGun: {
    name: 'machineGun',
    damage: 1,
    rate: 100,
    ammo: 20,
    reloadTime: 500,
  },
};
