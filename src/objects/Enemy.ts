import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig } from '~/config';
import { EasyStarManager } from '~/utils';

export class Enemy extends Phaser.Physics.Matter.Sprite {
  private target!: BasicEntity;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.size, EnemyConfig.size);
    this.setRectangle(EnemyConfig.size, EnemyConfig.size);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update(easystarManager: EasyStarManager) {
    this.moveTowards(easystarManager);
  }

  // Nouvelle méthode pour déplacer le joueur vers une cible
  moveTowards(easystarManager: EasyStarManager) {
    const startX = Math.floor(this.x / 32);
    const startY = Math.floor(this.y / 32);
    const endX = Math.floor(this.target.x / 32);
    const endY = Math.floor(this.target.y / 32);

    easystarManager.findPath(startX, startY, endX, endY, (path) => {
      if (path && path.length > 1) {
        // Utilise le deuxième point du chemin car le premier est la position actuelle
        const nextStep = path[1];
        const targetPosX = nextStep.x * 32;
        const targetPosY = nextStep.y * 32;

        // Calcule la direction vers le prochain point
        const direction = new Phaser.Math.Vector2(
          targetPosX - this.x,
          targetPosY - this.y
        ).normalize();
        const speed = 2;

        // Applique la vélocité en direction du prochain point
        this.setVelocity(direction.x * speed, direction.y * speed);
      } else {
        // Aucune destination trouvée ou pas de chemin
        this.setVelocity(0, 0);
      }
    });
  }
}
