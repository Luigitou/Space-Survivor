export type playerBuffConfigType = {
  cat: string;
  name: string;
  buffPercent: number;
  dropRate: number;
  maxLevel: number;
  type: string;
  description: string;
  gain: string;
};
export const playerBuffConfig: Record<string, playerBuffConfigType> = {
  bootOfSwiftness: {
    cat: 'player',
    name: 'bootOfSwiftness',
    buffPercent: 0.05,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'speed',
    description:
      "Des bottes légères qui augmentent la vitesse de déplacement, permettant d'éviter facilement les attaques ennemies.",
    gain: 'Vitesse augmentée : 5%',
  },
  maxHealth: {
    cat: 'player',
    name: 'maxHealth',
    buffPercent: 0.2,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'health',
    description:
      'Renforce la vitalité, augmentant le total de points de vie pour résister à davantage de dégâts.',
    gain: 'Points de vie supplémentaires : 20%',
  },
  windWalkerBoots: {
    cat: 'player',
    name: 'windWalkerBoots',
    buffPercent: 0.05,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'speed',
    description:
      'Conçues pour une mobilité maximale, ces bottes augmentent considérablement la vitesse de déplacement.',
    gain: 'Vitesse augmentée : 5%',
  },
  ironWill: {
    cat: 'player',
    name: 'ironWill',
    buffPercent: 0.035,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'health',
    description:
      'Confère une résistance accrue, augmentant les points de vie pour mieux encaisser les assauts ennemis.',
    gain: 'Points de vie supplémentaires : 3.5%',
  },
  sprintTonic: {
    cat: 'player',
    name: 'sprintTonic',
    buffPercent: 0.05,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'speed',
    description:
      "Une potion qui stimule la vitesse temporairement, parfaite pour esquiver les dangers en un clin d'œil.",
    gain: 'Vitesse augmentée : 5%',
  },
  heartOfStone: {
    cat: 'player',
    name: 'heartOfStone',
    buffPercent: 0.1,
    dropRate: 0.2,
    maxLevel: 5,
    type: 'health',
    description:
      'Un objet rare qui renforce la constitution, ajoutant un bonus significatif aux points de vie du porteur.',
    gain: 'Points de vie supplémentaires : 10%',
  },
};

export type weaponsBuffConfigType = {
  cat: string;
  name: string;
  buffPercent: number;
  effects: string;
  dropRate: number;
  maxLevel: number;
  type: string;
  description: string;
  gain: string;
};
export const weaponsBuffConfig: Record<string, weaponsBuffConfigType> = {
  rapidFire: {
    cat: 'weapons',
    name: 'rapidFire',
    buffPercent: 0.5,
    effects: '',
    dropRate: 0.2,
    maxLevel: 5,
    type: 'firerate',
    description:
      'Augmente considérablement la cadence de tir, permettant de tirer plus de projectiles en un minimum de temps.',
    gain: 'Dégâts supplémentaires : 50%',
  },
  strongBullet: {
    cat: 'weapons',
    name: 'strongBullet',
    buffPercent: 0.5,
    effects: '',
    dropRate: 0.2,
    maxLevel: 5,
    type: 'damage',
    description:
      'Des balles puissantes qui infligent des dégâts supplémentaires à chaque impact, parfait pour abattre des ennemis robustes.',
    gain: 'Dégâts supplémentaires : 50%',
  },
  InfiniteAmmo: {
    cat: 'weapons',
    name: 'InfiniteAmmo',
    buffPercent: 0,
    effects: 'infiniteammo',
    dropRate: 0.2,
    maxLevel: 1,
    type: 'ammo',
    description:
      'Un pouvoir mystérieux qui confère une réserve illimitée de munitions, permettant de tirer sans jamais manquer de balles.',
    gain: 'Munitions illimitées, Cadence de tir réduite de : 50%',
  },
  BurstFire: {
    cat: 'weapons',
    name: 'BurstFire',
    buffPercent: 0,
    effects: 'burstfire',
    dropRate: 0.2,
    maxLevel: 1,
    type: 'rate',
    description:
      'Un mode de tir en rafales mais qui réduit la cadence de tir, permettant de déchaîner une salve de balles en un instant.',
    gain: 'Tire en rafale, Cadence de tir réduite de : 100%',
  },
  PiercingShots: {
    cat: 'weapons',
    name: 'PiercingShots',
    buffPercent: 0,
    effects: 'piercingshots',
    dropRate: 0.2,
    maxLevel: 1,
    type: 'damage',
    description: 'Des balles perforantes qui transpercent les ennemis',
    gain: 'Tires perforants, Cadence de tir réduite de : 20%',
  },
};
