import Phaser from 'phaser';
import { gameConfig, menuConfig } from '~/config';
import { MainScene, MenuScene } from '~/scenes';

import { resize } from '~/utils';

const scenes: (typeof Phaser.Scene)[] = menuConfig.enableMainScene
  ? [MenuScene, MainScene]
  : [MainScene];

export const game = new Phaser.Game({
  ...gameConfig,
  scene: scenes,
});

window.addEventListener('resize', resize(game));
