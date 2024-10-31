import Phaser from 'phaser';
import { BasicEnemy, BasicEntity, Weapon } from '~/objects';
import { CustomScene } from '~/scenes/CustomScene';
import { EasyStarManager } from '~/utils';
import { EnemySpawnPoint, EnemyType } from '~/objects/EnemySpawnPoint';
import { EnemySpawnFactory } from '~/factories/EnemySpawnFactory';
import { SpawnConfig } from '~/config';

export class MainScene extends CustomScene {
  private player!: BasicEntity;
  private collisionLayer: Array<Phaser.Tilemaps.TilemapLayer | null> = [];
  private enemies: Array<BasicEnemy> = [];
  private easystarManager!: EasyStarManager;
  private leftMouseDown: boolean = false;
  private lastShotTime?: number;
  private timerText?: Phaser.GameObjects.Text;
  private initialTime: number = 0;
  private spawnPoints: EnemySpawnPoint[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private enemyCountText?: Phaser.GameObjects.Text;
  private weapon!: Weapon;
  private crosshair!: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: 'MainScene',
      physics: { default: 'matter' },
    });
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/map/Map.json');
    this.load.image('tiles', 'assets/map/Map-tileset.png');
    this.load.image('enemy', 'assets/sprites/enemy.png');
    this.load.image('enemyLaser', 'assets/sprites/laser-sprites/02.png');
    this.load.image('playerLaser', 'assets/sprites/laser-sprites/06.png');
    this.load.audio('laserSound', 'audio/blaster.mp3');
    this.load.image('xp1', 'assets/sprites/xp-sprites/xp1.png');
    this.load.image('xp2', 'assets/sprites/xp-sprites/xp2.png');
    this.load.image('xp3', 'assets/sprites/xp-sprites/xp3.png');
    this.load.image('crosshair', 'assets/sprites/crosshairs/crosshair066.png');

    // Ajouter un écouteur pour vérifier que le fichier a bien été chargé
    this.load.on('filecomplete', (key) => {
      if (key === 'crosshair') {
        console.log('La tilesheet crosshair est chargée avec succès.');
      }
    });
  }

  create() {
    super.create();

    // Création du crosshair
    this.crosshair = this.add.sprite(50, 50, 'crosshair', 11);
    this.crosshair.setDepth(1000);
    this.crosshair.setScale(0.5);
    console.log(this.crosshair);
    this.input.setDefaultCursor('none');

    // ----- Creation de la map
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('Spaceship', 'tiles');
    if (tileset) {
      map.createLayer('Ground', tileset, 0, 0);
      this.collisionLayer.push(map.createLayer('Walls', tileset, 0, 0));
      this.collisionLayer.push(map.createLayer('Objects', tileset, 0, 0));
    } else {
      console.error('Unable to load tileset');
    }

    // ----- Ajout des collisions
    this.collisionLayer.map((layer) => {
      if (layer) {
        layer.setCollisionByExclusion([-1]);
        this.matter.world.convertTilemapLayer(layer);
      }
    });

    // ----- Création du HUD
    this.hudContainer = this.add.container(0, 0);
    this.timerText = this.add.text(16, 16, 'Time: 0', {
      fontSize: '32px',
      color: '#FFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    this.hudContainer.add(this.timerText);

    // ----- Initialisation du chronomètre
    this.initialTime = 0;

    // ----- Initialisation de l'arme du joueur
    this.weapon = new Weapon(this, 'rifle');

    // ----- Création du joueur
    this.player = new BasicEntity(
      this,
      200,
      map.heightInPixels - 200,
      this.weapon
    );
    this.player.initHUD(this);

    this.time.addEvent({
      delay: 1000, // Appelé toutes les secondes
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.leftMouseDown = true;
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (pointer.leftButtonReleased()) {
        this.leftMouseDown = false;
      }
    });

    // ----- Configuration du wrapper de l'algorithme du chemin le plus court (Astar)
    this.easystarManager = new EasyStarManager();
    this.easystarManager.initializeGrid(map, ['Walls', 'Objects']);

    // ----- Création des points d'apparition
    this.createSpawnPoints(map);

    // Création initiale des ennemis
    this.spawnPoints.forEach((spawnPoint) => {
      const enemies = spawnPoint.spawnEnemies();
      enemies.forEach((enemy) => {
        enemy.setTarget(this.player);
        this.enemies.push(enemy);
      });
    });

    // ----- Ajout de la camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    // Configurer le timer de spawn
    this.spawnTimer = this.time.addEvent({
      delay: SpawnConfig.spawnDelay,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true,
    });

    if (SpawnConfig.debug.showEnemyCount) {
      this.enemyCountText = this.add.text(16, 16, '', {
        color: '#ffffff',
        backgroundColor: '#000000',
      });
      this.enemyCountText.setScrollFactor(0);
      this.updateEnemyCountText();
    }
  }

  updateTimer() {
    this.initialTime += 1;
    this.timerText?.setText('Time: ' + this.initialTime);
  }

  update() {
    // Mise à jour de la position du HUD
    this.hudContainer?.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );
    // Mise à jour des entités
    if (!this.player.active) return;
    this.player.update();
    this.enemies = this.enemies.filter((enemy) => enemy.active);
    this.enemies.forEach((enemy) => enemy.update(this.easystarManager));
    if (this.leftMouseDown) {
      if (
        !this.lastShotTime ||
        this.time.now - this.lastShotTime > this.weapon.getFireRate()
      ) {
        this.player.shoot();
        this.lastShotTime = this.time.now;
      }
    }

    this.crosshair.x = this.input.activePointer.worldX;
    this.crosshair.y = this.input.activePointer.worldY;
  }

  destroy() {
    this.spawnTimer?.destroy();
    this.enemyCountText?.destroy();
    this.spawnPoints.forEach((point) => point.destroy());
  }

  private createSpawnPoints(map: Phaser.Tilemaps.Tilemap) {
    const spawnLayer = map.getObjectLayer('SpawnPoints');

    if (spawnLayer && spawnLayer.objects) {
      spawnLayer.objects.forEach((spawnObject) => {
        const spawnPoint = EnemySpawnFactory.createSpawnPoint(
          this,
          spawnObject.x || 0,
          spawnObject.y || 0,
          (spawnObject.properties?.find((p) => p.name === 'enemyType')?.value ||
            'basic') as EnemyType
        );
        this.spawnPoints.push(spawnPoint);
      });
    }
  }

  private spawnEnemies() {
    if (this.enemies.length >= SpawnConfig.maxEnemies) return;

    this.spawnPoints.forEach((spawnPoint) => {
      const enemy = spawnPoint.spawnEnemy();
      if (enemy) {
        enemy.setTarget(this.player);
        this.enemies.push(enemy);

        enemy.once('destroy', () => {
          this.enemies = this.enemies.filter((e) => e !== enemy);
          spawnPoint.onEnemyDeath();
          this.updateEnemyCountText();
        });
      }
    });

    this.updateEnemyCountText();
  }

  private updateEnemyCountText() {
    if (this.enemyCountText) {
      this.enemyCountText.setText(
        `Ennemis: ${this.enemies.length}/${SpawnConfig.maxEnemies}`
      );
    }
  }
}
