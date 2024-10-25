import Phaser from 'phaser';
import CharacUp from 'src/assets/sprites/character/Up.png';
import CharacLeft from 'src/assets/sprites/character/Left.png';
import CharacRight from 'src/assets/sprites/character/Right.png';
import CharacDown from 'src/assets/sprites/character/Down.png';

export const loadCharacterAnimations = (scene: Phaser.Scene) => {
  scene.load.spritesheet('charac-entity-up', CharacUp, {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('charac-entity-left', CharacLeft, {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('charac-entity-right', CharacRight, {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet('charac-entity-down', CharacDown, {
    frameWidth: 64,
    frameHeight: 64,
  });
};

export const createCharacterAnimations = (scene: Phaser.Scene) => {
  scene.anims.create({
    key: 'walk-up',
    frames: scene.anims.generateFrameNumbers('charac-entity-up', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk-left',
    frames: scene.anims.generateFrameNumbers('charac-entity-left', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk-right',
    frames: scene.anims.generateFrameNumbers('charac-entity-right', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: 'walk-down',
    frames: scene.anims.generateFrameNumbers('charac-entity-down', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
};
