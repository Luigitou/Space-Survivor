import { BasicEnemy } from './BasicEnemy';
import { RangeEnemy } from './RangeEnemy';
import { SpawnConfig } from '~/config';
import { CaCEnemy } from './CaCEnemy';
import { BossEnemy } from './BossEnemy';

export class EnemySpawnPoint {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private debugGraphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    if (SpawnConfig.debug?.showSpawnZones) {
      this.debugGraphics = scene.add.graphics({
        lineStyle: { width: 1, color: 0xff0000, alpha: 0.5 },
      });
      this.debugGraphics.strokeCircle(x, y, 32);
    }
  }

  spawnEnemy(
    type: 'cac' | 'range' | 'boss'
  ): CaCEnemy | RangeEnemy | BossEnemy | null {
    switch (type) {
      case 'cac':
        return new CaCEnemy(this.scene, this.x, this.y);
      case 'range':
        return new RangeEnemy(this.scene, this.x, this.y);
      case 'boss':
        return new BossEnemy(this.scene, this.x, this.y);
      default:
        return null;
    }
  }

  destroy(): void {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
