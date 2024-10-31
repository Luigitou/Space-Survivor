export type EnemyType = 'cac' | 'range';

export interface WaveConfig {
  cacCount: number;
  rangeCount: number;
  spawnDelay: number;
}

export const SpawnConfig = {
  // Délai initial entre chaque spawn d'ennemi dans une vague (en ms)
  baseSpawnDelay: 1000,

  // Configuration des vagues
  waves: [
    {
      cacCount: 3,
      rangeCount: 1,
      spawnDelay: 1000,
    },
    {
      cacCount: 4,
      rangeCount: 2,
      spawnDelay: 900,
    },
    {
      cacCount: 5,
      rangeCount: 3,
      spawnDelay: 800,
    },
    {
      cacCount: 6,
      rangeCount: 4,
      spawnDelay: 700,
    },
  ] as WaveConfig[],

  debug: {
    showSpawnZones: true,
    showEnemyCount: true,
    showWaveInfo: true,
  },
} as const;
