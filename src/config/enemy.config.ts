export const EnemyConfig = {
  baseHealth: 5,
  baseSpeed: 2,
  sizeSprite: 64,
  sizeHitbox: 18,
  airFriction: 0.05,
  bounce: 1,
  mass: 1,
  showPath: false,
  pathDelay: 500,
};

export const CaCEnemyConfig = {
  attackRange: 50,
  attackRate: 1500,
};

export const RangeEnemyConfig = {
  projectileSpeed: 10,
  attackRange: 600,
  attackRate: 1000,
};

export const BossEnemyConfig = {
  health: 100,
  attackRange: 800,
  attackRate: 2000,
  projectileSpeed: 8,
};
