import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig, MapConfig } from '~/config';
import { EasyStarManager } from '~/utils';
import { Xp } from './Xp';

export class BasicEnemy extends Phaser.Physics.Matter.Sprite {
  protected target!: BasicEntity;
  protected xpValue!: string;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private health: number = EnemyConfig.baseHealth;
  private directionGraphics!: Phaser.GameObjects.Graphics;
  private path: { x: number; y: number }[] | null = null; // Chemin initialisé à null
  private lastPathfindingTime: number = 0;
  private pathfindingCooldown: number = 500; // Temps en ms entre les recalculs de chemin

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.sizeSprite, EnemyConfig.sizeSprite);
    this.setCircle(EnemyConfig.sizeHitbox);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);

    // Create graphics for path and direction visualization
    if (EnemyConfig.showPath) {
      this.pathGraphics = scene.add.graphics({
        lineStyle: { width: 2, color: 0x00ff00 },
        fillStyle: { color: 0xff0000 },
      });
    }
    this.directionGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0xff0000 }, // Red color for direction vector
    });
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update(easystarManager: EasyStarManager) {
    if (this.target) {
      const now = this.scene.time.now;

      // Recalculate path if necessary
      if (
        !this.path ||
        this.path.length === 0 ||
        now - this.lastPathfindingTime > this.pathfindingCooldown
      ) {
        this.nextTile(easystarManager);
        this.lastPathfindingTime = now;
        return; // Wait for path to be calculated
      }

      if (!this.path || this.path.length === 0) {
        // Wait for path to be calculated
        return;
      }

      // Calculate direction
      const direction = this.calculateDirection();
      if (!direction) return;
      this.moveInDirection(direction);
    } else {
      this.setVelocity(1, 0);
    }
  }

  public destroy(fromScene?: boolean) {
    EnemyConfig.showPath && this.pathGraphics.destroy();
    this.directionGraphics.destroy();
    super.destroy(fromScene);
  }

  // Method to put damages on the enemy and kill it if health is 0
  public takeDamage(damage: number) {
    this.health -= damage;
    console.log(this.health);

    if (this.health <= 0) {
      this.setActive(false);
      this.setVisible(false);
      this.dropXP();
      this.destroy();
    }
  }

  protected nextTile(easystarManager: EasyStarManager) {
    // Invalidate current path
    this.path = null;

    const startX = Math.floor(this.body!.position.x / MapConfig.tileSize);
    const startY = Math.floor(this.body!.position.y / MapConfig.tileSize);
    const endX = Math.floor(this.target.body!.position.x / MapConfig.tileSize);
    const endY = Math.floor(this.target.body!.position.y / MapConfig.tileSize);

    easystarManager.findPath(startX, startY, endX, endY, (path) => {
      if (path && path.length > 1) {
        this.path = path;
        EnemyConfig.showPath && this.visualizePath();
      } else {
        // No path found or no path
        this.clearPathVisualization();
        this.path = [];
      }
    });
  }

  protected calculateDirection() {
    // Ensure we have a path
    if (!this.path || this.path.length === 0) return null;

    // Decide which step to use
    let nextStepIndex = EnemyConfig.nextStepTileAmount;
    if (nextStepIndex >= this.path.length) {
      nextStepIndex = this.path.length - 1;
    }

    const nextStepTile = this.path[nextStepIndex];
    if (!nextStepTile) return null;

    // Convert tile coordinates to world coordinates without modifying the path
    const nextStepX =
      nextStepTile.x * MapConfig.tileSize + MapConfig.tileSize / 2;
    const nextStepY =
      nextStepTile.y * MapConfig.tileSize + MapConfig.tileSize / 2;

    // Calculate distance to next step
    const distanceToNextStep = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      nextStepX,
      nextStepY
    );

    // If we're close enough to the next step, remove it from the path
    const closeEnoughDistance = 5; // pixels
    if (distanceToNextStep < closeEnoughDistance) {
      // Remove passed steps
      this.path.splice(0, nextStepIndex + 1);

      // If we have no more path, return null
      if (this.path.length === 0) return null;

      // Recalculate direction
      return this.calculateDirection();
    }

    // Calculate vector to next step
    const vectorToTarget = new Phaser.Math.Vector2(
      nextStepX - this.x,
      nextStepY - this.y
    ).normalize();

    // Debugging logs
    console.log('Vector to Target:', vectorToTarget);

    return vectorToTarget;
  }

  protected moveInDirection(direction: Phaser.Math.Vector2) {
    const speed = EnemyConfig.baseSpeed;
    this.setVelocity(direction.x * speed, direction.y * speed);

    // Clear previous direction graphics
    this.directionGraphics.clear();

    // Draw the direction vector
    this.directionGraphics.lineBetween(
      this.x,
      this.y,
      this.x + direction.x * 50, // Multiply by 50 to lengthen the line
      this.y + direction.y * 50
    );
  }

  protected hasLineOfSight(): boolean {
    const startPoint = { x: this.x, y: this.y };
    const endPoint = { x: this.target.x, y: this.target.y };

    // @ts-ignore
    const collisions = Phaser.Physics.Matter.Matter.Query.ray(
      // @ts-ignore
      this.scene.matter.world.localWorld.bodies,
      startPoint,
      endPoint
    );

    // Si aucune collision ou seulement la collision avec le joueur;
    if (collisions.length === 0) {
      return true;
    }

    // Filtre les collisions, en vérifiant qu'il n'y a pas de mur ou d'obstacle
    for (const collision of collisions) {
      const hitObject = collision.body;

      // Vérifie si l'objet touché est un obstacle (ex. : mur)
      if (
        hitObject.gameObject &&
        hitObject.gameObject instanceof Phaser.Physics.Matter.TileBody
      ) {
        return false;
      }
    }

    // Aucun obstacle trouvé entre l'ennemi et le joueur
    return true;
  }

  private getInterestMap() {}

  private getDangerMap() {}

  private visualizePath() {
    this.pathGraphics.clear();

    this.path!.forEach((point, index) => {
      const posX = point.x * MapConfig.tileSize + MapConfig.tileSize / 2;
      const posY = point.y * MapConfig.tileSize + MapConfig.tileSize / 2;

      this.pathGraphics.fillCircle(posX, posY, 4);

      if (index > 0) {
        const prevPoint = this.path![index - 1];
        this.pathGraphics.lineBetween(
          prevPoint.x * MapConfig.tileSize + MapConfig.tileSize / 2,
          prevPoint.y * MapConfig.tileSize + MapConfig.tileSize / 2,
          posX,
          posY
        );
      }
    });
  }

  private clearPathVisualization() {
    this.pathGraphics.clear();
  }

  private dropXP() {
    const xp = new Xp(this.scene, this.x, this.y, 'xp1');
    this.scene.add.existing(xp);
  }
}
