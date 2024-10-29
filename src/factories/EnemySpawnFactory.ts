import { EnemySpawnPoint, EnemyType } from '~/objects/EnemySpawnPoint';

export class EnemySpawnFactory {
  static createSpawnPoint(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyType: EnemyType
  ): EnemySpawnPoint {
    return new EnemySpawnPoint(scene, x, y, enemyType);
  }
}
