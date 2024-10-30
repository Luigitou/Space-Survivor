// BasicEnemy.ts

import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig } from '~/config';
import { VectorField } from '~/utils';
import { Xp } from './Xp';

export class BasicEnemy extends Phaser.Physics.Matter.Sprite {
  protected target!: BasicEntity;
  protected xpValue!: string;
  private health: number = EnemyConfig.baseHealth;
  private directionGraphics!: Phaser.GameObjects.Graphics;
  private previousDirection: Phaser.Math.Vector2 | null = null;
  private vectorField: VectorField;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    vectorField: VectorField // Passer le vectorField en paramètre
  ) {
    super(scene.matter.world, x, y, 'enemy');

    scene.add.existing(this);

    this.setDisplaySize(EnemyConfig.sizeSprite, EnemyConfig.sizeSprite);
    this.setCircle(EnemyConfig.sizeHitbox);

    this.setFixedRotation();
    this.setFrictionAir(EnemyConfig.airFriction);
    this.setBounce(EnemyConfig.bounce);
    this.setMass(EnemyConfig.mass);

    // Create graphics for direction visualization
    this.directionGraphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0xff0000 },
    });

    this.vectorField = vectorField;
  }

  public setTarget(target: BasicEntity) {
    this.target = target;
  }

  public update(enemies: BasicEnemy[]) {
    if (this.target) {
      // Calculer la direction à partir du champ vectoriel
      const direction = this.calculateDirection();
      if (!direction || direction.length() === 0) {
        // Si aucune direction disponible, arrêter le mouvement
        this.setVelocity(0, 0);
        return;
      }

      // Calculer la force d'évitement
      const avoidance = this.calculateAvoidance(enemies);

      // Combiner la direction du champ vectoriel avec la force d'évitement
      const combinedDirection = direction.clone().add(avoidance).normalize();

      this.moveInDirection(combinedDirection);
    } else {
      this.setVelocity(0, 0);
    }
  }

  public destroy(fromScene?: boolean) {
    this.directionGraphics.destroy();
    super.destroy(fromScene);
  }

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

  protected calculateDirection(): Phaser.Math.Vector2 | null {
    // Obtenir le vecteur à la position actuelle
    const direction = this.vectorField.getVectorAt(this.x, this.y);

    if (direction.length() === 0) {
      return null;
    }

    return direction.normalize();
  }

  protected moveInDirection(direction: Phaser.Math.Vector2) {
    const speed = EnemyConfig.baseSpeed;

    // Appliquer la vitesse
    this.setVelocity(direction.x * speed, direction.y * speed);

    // Clear previous direction graphics
    this.directionGraphics.clear();

    // Draw the direction vector
    this.directionGraphics.lineBetween(
      this.x,
      this.y,
      this.x + direction.x * 50,
      this.y + direction.y * 50
    );
  }

  /**
   * Calcule une force d'évitement pour éviter les autres ennemis proches.
   * @param enemies Liste de tous les ennemis dans la scène.
   * @returns Vecteur de répulsion.
   */
  private calculateAvoidance(enemies: BasicEnemy[]): Phaser.Math.Vector2 {
    if (enemies.length === 0) return new Phaser.Math.Vector2(0, 0);
    const avoidance = new Phaser.Math.Vector2(0, 0);
    const avoidanceRadius = 50; // en pixels

    enemies.forEach((enemy) => {
      if (enemy === this) return; // Ignorer soi-même
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y
      );
      if (distance < avoidanceRadius && distance > 0) {
        const repulsion = new Phaser.Math.Vector2(
          this.x - enemy.x,
          this.y - enemy.y
        );
        repulsion.normalize();
        repulsion.scale((avoidanceRadius - distance) / avoidanceRadius); // Plus proche, plus fort
        avoidance.add(repulsion);
      }
    });

    return avoidance;
  }

  private dropXP() {
    const xp = new Xp(this.scene, this.x, this.y, 'xp1');
    this.scene.add.existing(xp);
  }
}
