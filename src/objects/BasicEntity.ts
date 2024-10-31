import { CustomScene } from '~/scenes/CustomScene';
import { PlayerConfig } from '~/config';
import { Weapon } from '~/objects/Weapon';

export class BasicEntity extends Phaser.Physics.Matter.Sprite {
  public xp: number = 0;
  protected target: { x: number; y: number } = { x: 0, y: 0 };
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private health: number = PlayerConfig.baseHealth;
  private level: number = 1;
  private levelText!: Phaser.GameObjects.Text;
  private weapon: Weapon;
  private keys: any;

  constructor(scene: CustomScene, x: number, y: number, weapon: Weapon) {
    super(scene.matter.world, x, y, 'basic-entity');
    this.setActive(true);
    this.weapon = weapon;

    scene.add.existing(this);

    this.setRectangle(PlayerConfig.size, PlayerConfig.size);
    this.setFixedRotation();
    this.setOrigin(0.5, 0.5);
    this.setFrictionAir(PlayerConfig.airFriction);
    this.setBounce(PlayerConfig.bounce);
    this.setMass(PlayerConfig.mass);

    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.keys = scene.input.keyboard?.addKeys('Z,Q,S,D,R');
  }

  initHUD(scene: CustomScene) {
    this.levelText = scene.add.text(16, 48, 'Level: 1', {
      fontSize: '32px',
      color: '#FFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });

    // Example usage of hudContainer
    scene.hudContainer.add(this.levelText);
  }

  update() {
    const speed = PlayerConfig.baseSpeed;

    let velocity = {
      x: 0,
      y: 0,
    };

    if (this.cursors?.left?.isDown || this.keys?.Q?.isDown) {
      velocity.x = -speed;
    } else if (this.cursors?.right?.isDown || this.keys?.D?.isDown) {
      velocity.x = speed;
    }

    if (this.cursors?.up?.isDown || this.keys?.Z?.isDown) {
      velocity.y = -speed;
    } else if (this.cursors?.down?.isDown || this.keys?.S?.isDown) {
      velocity.y = speed;
    }

    if (this.keys?.R?.isDown) {
      this.weapon.reload();
    }

    this.setVelocity(velocity.x, velocity.y);
  }

  // Take damage from an enemy
  public takeDamage(damage: number) {
    this.health -= damage;
    console.log(this.health);

    if (this.health <= 0 && !PlayerConfig.godMode) {
      console.log('Player is dead');
      this.setActive(false);
      this.setVisible(false);
    }
  }

  // Shoot a projectile
  public shoot() {
    this.weapon.shoot(this);
  }

  // Add xp to the player
  public addXp(amount: number): void {
    this.xp += amount;
    if (this.xp >= PlayerConfig.xpBarMaxValue) {
      this.levelUp();
      this.xp = PlayerConfig.xpBarMinValue;
    }
  }

  // Level up the player
  // voir pour ajouter des stats supplémentaires ou
  // des selections de compétences / d'items
  public levelUp() {
    this.level++;
    this.levelText.setText('Level: ' + this.level);
  }
}
