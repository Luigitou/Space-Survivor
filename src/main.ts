import Phaser from 'phaser';
import { gameConfig, menuConfig } from '~/config';
import { MainScene, MenuScene, LevelUpScene, GameOverScene } from '~/scenes';

import { resize } from '~/utils';

const scenes: (typeof Phaser.Scene)[] = menuConfig.enableMainScene
  ? [MenuScene, MainScene, LevelUpScene, GameOverScene]
  : [MainScene, LevelUpScene, GameOverScene];

export const game = new Phaser.Game({
  ...gameConfig,
  scene: scenes,
});

window.addEventListener('resize', resize(game));
