import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig } from '~/config';
import { EasyStarManager } from '~/utils';

export class Enemy extends Phaser.Physics.Matter.Sprite {
  private target!: BasicEntity;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private path: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.size, EnemyConfig.size);
    this.setCircle(12);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);

    // Création d'un graphique pour visualiser le chemin
    this.pathGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0x00ff00 },
      fillStyle: { color: 0xff0000 },
    });
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update(easystarManager: EasyStarManager) {
    this.moveTowards(easystarManager);
  }

  // Nouvelle méthode pour déplacer le joueur vers une cible
  moveTowards(easystarManager: EasyStarManager) {
    const startX = Math.floor(this.body!.position.x / 32);
    const startY = Math.floor(this.body!.position.y / 32);
    const endX = Math.floor(this.target.body!.position.x / 32);
    const endY = Math.floor(this.target.body!.position.y / 32);

    easystarManager.findPath(startX, startY, endX, endY, (path) => {
      if (path && path.length > 1) {
        this.path = path;
        this.visualizePath();

        // Utilise le deuxième point du chemin car le premier est la position actuelle
        const nextStep = path[1];
        const direction = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          nextStep.x * 32 + 16,
          nextStep.y * 32 + 16
        );
        const speed = EnemyConfig.baseSpeed;

        // Applique la vélocité en direction du prochain point
        this.setVelocity(
          Math.cos(direction) * speed,
          Math.sin(direction) * speed
        );
      } else {
        // Aucune destination trouvée ou pas de chemin
        this.setVelocity(0, 0);
        this.clearPathVisualization();
      }
    });
  }

  public destroy(fromScene?: boolean) {
    this.pathGraphics.destroy();
    super.destroy(fromScene);
  }

  // Méthode pour visualiser le chemin calculé
  private visualizePath() {
    // Efface les graphiques précédents
    this.pathGraphics.clear();

    // Dessine chaque point du chemin
    this.path.forEach((point, index) => {
      const posX = point.x * 32 + 16; // Centré sur la case
      const posY = point.y * 32 + 16;

      // Dessine un cercle pour chaque point de passage
      this.pathGraphics.fillCircle(posX, posY, 4);

      // Trace une ligne vers le prochain point
      if (index > 0) {
        const prevPoint = this.path[index - 1];
        this.pathGraphics.lineBetween(
          prevPoint.x * 32 + 16,
          prevPoint.y * 32 + 16,
          posX,
          posY
        );
      }
    });
  }

  private clearPathVisualization() {
    this.pathGraphics.clear();
  }
}
