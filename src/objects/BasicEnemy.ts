import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig, MapConfig } from '~/config';
import { EasyStarManager } from '~/utils';

export class BasicEnemy extends Phaser.Physics.Matter.Sprite {
  protected target!: BasicEntity;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private health: number = EnemyConfig.baseHealth;
  private path: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.sizeSprite, EnemyConfig.sizeSprite);
    this.setCircle(EnemyConfig.sizeHitbox);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);

    // Create a graphics for path visualization
    if (EnemyConfig.showPath) {
      this.pathGraphics = scene.add.graphics({
        lineStyle: { width: 2, color: 0x00ff00 },
        fillStyle: { color: 0xff0000 },
      });
    }
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update(easystarManager: EasyStarManager) {
    if (this.target) {
      this.moveTowards(easystarManager);
    } else {
      this.setVelocity(1, 0);
    }
  }

  public destroy(fromScene?: boolean) {
    EnemyConfig.showPath && this.pathGraphics.destroy();
    super.destroy(fromScene);
  }

  // New method to move the player towards a target
  protected moveTowards(easystarManager: EasyStarManager) {
    const startX = Math.floor(this.body!.position.x / MapConfig.tileSize);
    const startY = Math.floor(this.body!.position.y / MapConfig.tileSize);
    const endX = Math.floor(this.target.body!.position.x / MapConfig.tileSize);
    const endY = Math.floor(this.target.body!.position.y / MapConfig.tileSize);

    easystarManager.findPath(startX, startY, endX, endY, (path) => {
      if (path && path.length > 1) {
        this.path = path;
        EnemyConfig.showPath && this.visualizePath();

        // Use the second point of the path because the first is the current position
        const nextStep = path[1];
        const direction = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          nextStep.x * MapConfig.tileSize + MapConfig.tileSize / 2,
          nextStep.y * MapConfig.tileSize + MapConfig.tileSize / 2
        );
        const speed = EnemyConfig.baseSpeed;

        // Apply velocity in direction of next point
        this.setVelocity(
          Math.cos(direction) * speed,
          Math.sin(direction) * speed
        );
      } else {
        // No path found or no path
        this.setVelocity(0, 0);
        this.clearPathVisualization();
      }
    });
  }

  // Draw path visualization
  private visualizePath() {
    this.pathGraphics.clear();

    this.path.forEach((point, index) => {
      const posX = point.x * MapConfig.tileSize + MapConfig.tileSize / 2;
      const posY = point.y * MapConfig.tileSize + MapConfig.tileSize / 2;

      this.pathGraphics.fillCircle(posX, posY, 4);

      if (index > 0) {
        const prevPoint = this.path[index - 1];
        this.pathGraphics.lineBetween(
          prevPoint.x * MapConfig.tileSize + MapConfig.tileSize / 2,
          prevPoint.y * MapConfig.tileSize + MapConfig.tileSize / 2,
          posX,
          posY
        );
      }
    });
  }

  // Method to put damages on the enemy and kill it if health is 0
  public takeDamage(damage: number) {
    this.health -= damage;
    console.log(this.health);

    if (this.health <= 0) {
      console.log('Enemy was killed');
      this.setActive(false);
      this.setVisible(false);
      this.destroy();
    }
  }

  private clearPathVisualization() {
    this.pathGraphics.clear();
  }
}
