import { EnemySpawnPoint } from '~/objects/EnemySpawnPoint';

export class EnemySpawnFactory {
  static createSpawnPoint(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): EnemySpawnPoint {
    return new EnemySpawnPoint(scene, x, y);
  }
}
