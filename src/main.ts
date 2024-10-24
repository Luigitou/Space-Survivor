import Phaser from 'phaser';
import { gameConfig } from '~/config';
import { MainScene } from '~/scenes';
import { resize } from '~/utils';

export const game = new Phaser.Game({ ...gameConfig, scene: MainScene });

window.addEventListener('resize', resize(game));
