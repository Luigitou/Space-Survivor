import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig } from '~/config';
import { EasyStarManager } from '~/utils';

export class Enemy extends Phaser.Physics.Matter.Sprite {
  private target!: BasicEntity;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private directionGraphics!: Phaser.GameObjects.Graphics;
  private path: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.size, EnemyConfig.size);
    this.setCircle(EnemyConfig.size / 2);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);

    // Création d'un graphique pour visualiser le chemin
    this.pathGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0x00ff00 },
      fillStyle: { color: 0xff0000 },
    });

    // Création d'un graphique pour visualiser le vecteur de direction
    this.directionGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0x0000ff }, // Bleu pour le vecteur de direction
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
        const nextStep = path[2];
        const targetPosX = nextStep.x * 32;
        const targetPosY = nextStep.y * 32;

        // Calcule la direction vers le prochain point
        const direction = new Phaser.Math.Vector2(
          targetPosX - this.body!.position.x,
          targetPosY - this.body!.position.y
        ).normalize();
        const speed = EnemyConfig.baseSpeed;

        // Applique la vélocité en direction du prochain point
        this.visualizeDirection(direction);
        this.setVelocity(direction.x * speed, direction.y * speed); // TODO: Vérifier si la vitesse est correcte
      } else {
        // Aucune destination trouvée ou pas de chemin
        console.log('No path found');
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

  private visualizeDirection(direction: Phaser.Math.Vector2) {
    // Efface le graphique précédent
    this.directionGraphics.clear();

    // Position de départ du vecteur (position de l'ennemi)
    const startX = this.body!.position.x;
    const startY = this.body!.position.y;

    // Calcul de la position de fin du vecteur
    const length = 50; // Longueur du vecteur pour la visualisation
    const endX = startX + direction.x * length;
    const endY = startY + direction.y * length;

    // Dessine la ligne du vecteur de direction
    this.directionGraphics.lineBetween(startX, startY, endX, endY);

    // Optionnel : Dessine une flèche au bout du vecteur
    this.drawArrowHead(startX, startY, endX, endY);
  }

  // Méthode optionnelle pour dessiner une flèche au bout du vecteur
  private drawArrowHead(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10; // Taille de la flèche
    const arrowAngle = Math.PI / 6; // Angle entre la ligne et les côtés de la flèche

    const leftX = toX - arrowLength * Math.cos(angle - arrowAngle);
    const leftY = toY - arrowLength * Math.sin(angle - arrowAngle);

    const rightX = toX - arrowLength * Math.cos(angle + arrowAngle);
    const rightY = toY - arrowLength * Math.sin(angle + arrowAngle);

    this.directionGraphics.beginPath();
    this.directionGraphics.moveTo(toX, toY);
    this.directionGraphics.lineTo(leftX, leftY);
    this.directionGraphics.moveTo(toX, toY);
    this.directionGraphics.lineTo(rightX, rightY);
    this.directionGraphics.strokePath();
  }
}
