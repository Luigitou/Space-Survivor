import Phaser from 'phaser';
import { gameConfig } from '~/config';
import { MainScene } from '~/scenes';

export const game = new Phaser.Game({ ...gameConfig, scene: MainScene });
