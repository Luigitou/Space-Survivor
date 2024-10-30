import { BasicEnemy } from './BasicEnemy';
import { RangeEnemy } from './RangeEnemy';
import { SpawnConfig } from '~/config';

export type EnemyType = 'basic' | 'range';

export class EnemySpawnPoint {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private enemyType: EnemyType;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private spawnedCount: number = 0;
  private lastSpawnTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyType: EnemyType) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.enemyType = enemyType;

    if (SpawnConfig.debug?.showSpawnZones) {
      this.debugGraphics = scene.add.graphics({
        lineStyle: { width: 1, color: 0xff0000, alpha: 0.5 },
      });
      this.debugGraphics.strokeCircle(x, y, 32);
    }
  }

  spawnEnemies(): BasicEnemy[] {
    const enemies: BasicEnemy[] = [];
    const spawnCount = SpawnConfig.types[this.enemyType].spawnCount;

    for (let i = 0; i < spawnCount; i++) {
      switch (this.enemyType) {
        case 'basic':
          enemies.push(new BasicEnemy(this.scene, this.x, this.y));
          break;
        case 'range':
          enemies.push(new RangeEnemy(this.scene, this.x, this.y));
          break;
      }
    }

    return enemies;
  }

  spawnEnemy(): BasicEnemy {
    switch (this.enemyType) {
      case 'basic':
        return new BasicEnemy(this.scene, this.x, this.y);
      case 'range':
        return new RangeEnemy(this.scene, this.x, this.y);
      default:
        return new BasicEnemy(this.scene, this.x, this.y);
    }
  }

  onEnemyDeath(): void {
    // A peut etre supprimer: gérer la logique après la mort d'un ennemi
    if (this.spawnedCount > 0) {
      this.spawnedCount--;
    }
  }

  destroy(): void {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
  }

  getSpawnedCount(): number {
    return this.spawnedCount;
  }

  getEnemyType(): EnemyType {
    return this.enemyType;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
