export const SpawnConfig = {
  // Délai entre chaque vague de spawn (en ms)
  spawnDelay: 5000,

  // Nombre maximum d'ennemis simultanés
  maxEnemies: 10,

  // Configuration par type d'ennemi
  types: {
    basic: {
      // Probabilité d'apparition (sur 100)
      spawnChance: 70,
      // Nombre maximum de ce type d'ennemi
      maxCount: 10,
      // Délai minimum entre deux spawns de ce type (en ms)
      minSpawnDelay: 2000,
      // Nombre d'ennemis par spawn point
      spawnCount: 3,
    },
    range: {
      spawnChance: 100,
      maxCount: 10,
      minSpawnDelay: 3000,
      spawnCount: 2,
    },
  },

  // Debug
  debug: {
    // Afficher les zones de spawn
    showSpawnZones: true,
    // Afficher le compte d'ennemis
    showEnemyCount: true,
  },
} as const;
