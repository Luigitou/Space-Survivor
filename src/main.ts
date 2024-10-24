import Phaser from 'phaser';
import { gameConfig } from '~/config';
import { MainScene, MenuScene } from '~/scenes';

import { resize } from '~/utils';

export const game = new Phaser.Game({
  ...gameConfig,
  scene: [MenuScene, MainScene],
});

window.addEventListener('resize', resize(game));
