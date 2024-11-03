import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig, MapConfig } from '~/config';
import { EasyStarManager } from '~/utils';
import { Xp } from './Xp';
import { MainScene } from '~/scenes';

export class BasicEnemy extends Phaser.Physics.Matter.Sprite {
  protected target!: BasicEntity;
  protected xpValue!: string;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private health: number = EnemyConfig.baseHealth;
  private path: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene.matter.world, x, y, texture);

    scene.add.existing(this);
    this.setDepth(750);

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

    scene.time.addEvent({
      delay: EnemyConfig.pathDelay,
      callback: () => this.calculatePath((scene as MainScene).easystarManager),
      loop: true,
    });
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update() {
    if (this.target) {
      this.moveTowards();
    } else {
      this.setVelocity(1, 0);
    }
  }

  public destroy(fromScene?: boolean) {
    EnemyConfig.showPath && this.pathGraphics.destroy();
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

  // New method to move the player towards a target
  protected calculatePath(easystarManager: EasyStarManager) {
    console.log('Calculating path');
    if (!this.target || !this.body) return;
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
        this.setVelocity(0, 0);
        this.clearPathVisualization();
      }
    });
  }

  private moveTowards() {
    if (!this.path || this.path.length < 2) return;
    const nextStep = this.path[1];

    const nextX = nextStep.x * MapConfig.tileSize + MapConfig.tileSize / 2;
    const nextY = nextStep.y * MapConfig.tileSize + MapConfig.tileSize / 2;

    const direction = Phaser.Math.Angle.Between(this.x, this.y, nextX, nextY);
    const speed = EnemyConfig.baseSpeed;

    this.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);

    // Si l'ennemi est suffisamment proche du point actuel, passe au point suivant
    const distanceToNextStep = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      nextX,
      nextY
    );
    if (distanceToNextStep < MapConfig.tileSize / 2) {
      this.path.shift(); // Supprime le premier point pour avancer
    }
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

  private clearPathVisualization() {
    this.pathGraphics.clear();
  }

  private dropXP() {
    const xp = new Xp(this.scene, this.x, this.y, 'xp1');
    this.scene.add.existing(xp);
  }
}
