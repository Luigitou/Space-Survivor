import Phaser from 'phaser';
import { CustomScene } from '~/scenes/CustomScene';
import { BasicEntity, RangeEnemy, BasicEnemy } from '~/objects';
import { EasyStarManager } from '~/utils';

export class MainScene extends CustomScene {
  private player!: BasicEntity;
  private collisionLayer: Array<Phaser.Tilemaps.TilemapLayer | null> = [];
  private enemies: Array<BasicEnemy> = [];
  private easystarManager!: EasyStarManager;
  private leftMouseDown: boolean = false;
  private lastShotTime?: number;
  private timerText?: Phaser.GameObjects.Text;
  private initialTime: number = 0;

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
  }

  create() {
    super.create();
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

    // ----- Création du joueur
    this.player = new BasicEntity(this, 200, map.heightInPixels - 200);
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

    // ----- Création des ennemis
    this.enemies.push(new RangeEnemy(this, 1100, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1200, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1300, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1300, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1100, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1200, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1300, map.heightInPixels - 200));
    this.enemies.push(new RangeEnemy(this, 1300, map.heightInPixels - 200));

    this.enemies.forEach((enemy) => {
      enemy.setTarget(this.player);
    });

    // ----- Ajout de la camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
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
      if (!this.lastShotTime || this.time.now - this.lastShotTime > 500) {
        this.player.shoot();
        this.lastShotTime = this.time.now;
      }
    }
  }
}
