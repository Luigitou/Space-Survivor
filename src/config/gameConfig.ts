import Phaser from 'phaser';

export const gameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 },
      debug: true,
    },
  },
};
