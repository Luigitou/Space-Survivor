import Phaser from 'phaser';
import { BasicEntity, CaCEnemy } from '~/objects';
import { BasicEnemy } from '~/objects/BasicEnemy';
import { EasyStarManager } from '~/utils';

export class MainScene extends Phaser.Scene {
  private player!: BasicEntity;
  private collisionLayer: Array<Phaser.Tilemaps.TilemapLayer | null> = [];
  private enemies: Array<BasicEnemy> = [];
  private easystarManager!: EasyStarManager;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.tilemapTiledJSON('map', 'assets/map/Map.json');
    this.load.image('tiles', 'assets/map/Map-tileset.png');
    this.load.image('enemy', 'assets/sprites/enemy.png');
    this.load.image('enemyLaser', 'assets/sprites/laser-sprites/02.png');
  }

  create() {
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

    // ----- Création du joueur
    this.player = new BasicEntity(this, 200, map.heightInPixels - 200);

    // ----- Configuration du wrapper de l'algorithme du chemin le plus court (Astar)
    this.easystarManager = new EasyStarManager();
    this.easystarManager.initializeGrid(map, ['Walls', 'Objects']);

    // ----- Création des ennemis
    this.enemies.push(new CaCEnemy(this, 1100, map.heightInPixels - 200));

    this.enemies.forEach((enemy) => {
      enemy.setTarget(this.player);
    });

    // ----- Ajout de la camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
  }

  update() {
    if (!this.player.active) return;
    this.player.update();
    this.enemies.forEach((enemy) => enemy.update(this.easystarManager));
  }
}
