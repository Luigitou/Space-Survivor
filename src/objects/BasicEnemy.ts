// BasicEnemy.ts

import { BasicEntity } from '~/objects/BasicEntity';
import { EnemyConfig, MapConfig } from '~/config';
import { VectorField } from '~/utils';
import { Xp } from './Xp';

export class BasicEnemy extends Phaser.Physics.Matter.Sprite {
  protected target!: BasicEntity;
  protected xpValue!: string;
  private health: number = EnemyConfig.baseHealth;
  private directionGraphics!: Phaser.GameObjects.Graphics;
  private vectorField: VectorField;
  private sensors: {
    sensor: MatterJS.BodyType;
    direction: Phaser.Math.Vector2;
  }[] = [];
  private avoidance: Array<Phaser.Math.Vector2> = [];

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
    this.createSensors();
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
      this.calculateAvoidance();
      this.moveInDirection(direction);
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

    // Combiner la direction du champ vectoriel avec la force d'évitement
    //const combinedDirection = direction.clone().add(avoidance).normalize();

    if (direction.length() === 0) {
      return null;
    }

    return direction;
  }

  protected moveInDirection(direction: Phaser.Math.Vector2) {
    const speed = EnemyConfig.baseSpeed;

    let combinedDirection = direction;
    let avoidanceVector: Phaser.Math.Vector2 | null = null;

    if (this.avoidance.length > 0) {
      let combinedX = 0;
      let combinedY = 0;
      this.avoidance.forEach((avoidance) => {
        combinedX += avoidance.x;
        combinedY += avoidance.y;
      });
      avoidanceVector = new Phaser.Math.Vector2(
        combinedX,
        combinedY
      ).normalize();
      avoidanceVector.scale(1.25);
      combinedDirection = combinedDirection
        .clone()
        .add(avoidanceVector)
        .normalize();
    }

    if (avoidanceVector) {
      console.log('Combined direction:', combinedDirection);
      this.setVelocity(
        combinedDirection.x * speed,
        combinedDirection.y * speed
      );
    } else {
      this.setVelocity(direction.x * speed, direction.y * speed);
    }

    // Appliquer la vitesse

    // Clear previous direction graphics
    this.directionGraphics.clear();

    // Draw the direction vector
    this.directionGraphics.lineBetween(
      this.x,
      this.y,
      this.x + combinedDirection.x * 50,
      this.y + combinedDirection.y * 50
    );
  }

  private createSensors() {
    const avoidanceRadius = EnemyConfig.detectionRadius;

    // Positions des sensors autour de l'ennemi
    const directions = [
      new Phaser.Math.Vector2(1, 0).normalize(), // Droite
      new Phaser.Math.Vector2(-1, 0).normalize(), // Gauche
      new Phaser.Math.Vector2(0, 1).normalize(), // Bas
      new Phaser.Math.Vector2(0, -1).normalize(), // Haut
      new Phaser.Math.Vector2(1, 1).normalize(), // Bas-Droite
      new Phaser.Math.Vector2(-1, 1).normalize(), // Bas-Gauche
      new Phaser.Math.Vector2(1, -1).normalize(), // Haut-Droite
      new Phaser.Math.Vector2(-1, -1).normalize(), // Haut-Gauche
    ];

    this.sensors = [];

    directions.forEach((direction) => {
      const sensor = this.scene.matter.add.circle(
        this.x + EnemyConfig.sensorDetectionRadius,
        this.y + EnemyConfig.sensorDetectionRadius,
        avoidanceRadius,
        {
          isSensor: true,
          onCollideCallback: (
            event: Phaser.Types.Physics.Matter.MatterCollisionData
          ) => {
            const { bodyA, bodyB } = event;
            const otherBody = bodyA === this.body ? bodyB : bodyA;

            if (otherBody.gameObject) {
              const otherEntity = otherBody.gameObject;

              if (otherEntity instanceof BasicEnemy) {
                console.log('Collision detected with an enemy');
              } else if (otherEntity instanceof BasicEntity) {
                console.log('Collision detected with a player');
              } else if (
                otherEntity instanceof Phaser.Physics.Matter.TileBody
              ) {
                // Calcul du centre de la tuile
                const tileCenterX = otherEntity.body!.position.x;
                const tileCenterY = otherEntity.body!.position.y;

                console.log('Centre de la tuile:', tileCenterX, tileCenterY);

                // Création d'un rectangle rouge sur la tuile de collision
                const graphics = this.scene.add.graphics();
                graphics.fillStyle(0xff0000, 0.5); // Rouge avec opacité 50%
                graphics.fillRect(
                  tileCenterX - MapConfig.tileSize / 2,
                  tileCenterY - MapConfig.tileSize / 2,
                  MapConfig.tileSize,
                  MapConfig.tileSize
                );

                // Calcul de la direction opposée pour l'évitement
                const oppositeDirection = new Phaser.Math.Vector2(
                  this.x - tileCenterX,
                  this.y - tileCenterY
                );
                console.log(
                  'Collision detected with a tile',
                  oppositeDirection.normalize()
                );
                this.avoidance.push(oppositeDirection.normalize());
              }
            }
          },
          onCollideEndCallback: () => {
            this.avoidance = [];
          },
        }
      );
      this.sensors.push({ sensor, direction });
    });
  }

  private calculateAvoidance() {
    // Mettre à jour les sensors autour de l'ennemi
    this.sensors.forEach(({ sensor, direction }) => {
      sensor.position.x =
        this.x + direction.x * EnemyConfig.sensorDetectionRadius;
      sensor.position.y =
        this.y + direction.y * EnemyConfig.sensorDetectionRadius;
    });
  }

  private dropXP() {
    const xp = new Xp(this.scene, this.x, this.y, 'xp1');
    this.scene.add.existing(xp);
  }
}
