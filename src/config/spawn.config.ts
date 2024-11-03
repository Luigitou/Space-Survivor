export type EnemyType = 'cac' | 'range';

export interface WaveConfig {
  cacCount: number;
  rangeCount: number;
  spawnDelay: number;
  waveDuration?: number; // Durée max de la vague en ms (optionnel)
  requireAllDefeated: boolean; // Si true, tous les ennemis doivent être vaincus
}

export const SpawnConfig = {
  // Délai initial entre chaque spawn d'ennemi dans une vague (en ms)
  baseSpawnDelay: 1000,

  // Configuration des vagues
  waves: [
    {
      cacCount: 20,
      rangeCount: 1,
      spawnDelay: 100,
      waveDuration: 30000, // 30 secondes
      requireAllDefeated: true,
    },
    {
      cacCount: 4,
      rangeCount: 2,
      spawnDelay: 900,
      waveDuration: 35000, // 35 secondes
      requireAllDefeated: false,
    },
    {
      cacCount: 5,
      rangeCount: 3,
      spawnDelay: 800,
      waveDuration: 40000, // 40 secondes
      requireAllDefeated: true,
    },
    {
      cacCount: 6,
      rangeCount: 4,
      spawnDelay: 700,
      waveDuration: 45000, // 45 secondes
      requireAllDefeated: false,
    },
  ] as WaveConfig[],

  debug: {
    showSpawnZones: true,
    showEnemyCount: true,
    showWaveInfo: true,
  },
} as const;
