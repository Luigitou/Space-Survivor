import Phaser from 'phaser';
import { gameConfig, menuConfig } from '~/config';
import { MainScene, MenuScene, LevelUpScene } from '~/scenes';

import { resize } from '~/utils';

const scenes: (typeof Phaser.Scene)[] = menuConfig.enableMainScene
  ? [MenuScene, MainScene, LevelUpScene]
  : [MainScene, LevelUpScene];

export const game = new Phaser.Game({
  ...gameConfig,
  scene: scenes,
});

window.addEventListener('resize', resize(game));
