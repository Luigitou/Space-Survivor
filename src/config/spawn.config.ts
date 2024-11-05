export type EnemyType = 'cac' | 'range' | 'boss';

export interface WaveConfig {
  cacCount: number;
  rangeCount: number;
  bossCount: number;
  spawnDelay: number;
  waveDuration?: number; // Durée max de la vague en ms (optionnel)
  requireAllDefeated: boolean; // Si true, tous les ennemis doivent être vaincus
}

function generateWave(waveNumber: number): WaveConfig {
  // Vague de boss à partir de la vague 4, puis tous les 4 niveaux
  if (waveNumber >= 4 && waveNumber % 4 === 0) {
    return {
      cacCount: Math.floor(2 + waveNumber * 0.5),
      rangeCount: Math.floor(1 + waveNumber * 0.3),
      bossCount: Math.floor((waveNumber - 4) / 4) + 1,
      spawnDelay: 1000,
      requireAllDefeated: true,
    };
  }

  // Vagues normales avec difficulté progressive
  return {
    cacCount: Math.floor(5 + waveNumber),
    rangeCount: Math.floor(3 + waveNumber * 2),
    bossCount: 0,
    spawnDelay: Math.max(200, 1000 - waveNumber * 50),
    waveDuration: 30000,
    requireAllDefeated: waveNumber % 2 === 0,
  };
}

export const SpawnConfig = {
  // Délai initial entre chaque spawn d'ennemi dans une vague (en ms)
  baseSpawnDelay: 1000,

  // Obtenir la configuration d'une vague
  getWave: (waveNumber: number) => generateWave(waveNumber),

  debug: {
    showSpawnZones: false,
    showEnemyCount: true,
    showWaveInfo: true,
  },
} as const;
