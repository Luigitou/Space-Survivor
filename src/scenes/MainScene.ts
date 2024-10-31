import Phaser from 'phaser';
import { BasicEntity, CaCEnemy, BasicEnemy, RangeEnemy } from '~/objects';
import { CustomScene } from '~/scenes/CustomScene';
import { EasyStarManager } from '~/utils';
import { EnemySpawnPoint } from '~/objects/EnemySpawnPoint';
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
  private currentWave: number = 0;
  private remainingEnemies: { cac: number; range: number } = {
    cac: 0,
    range: 0,
  };
  private waveText?: Phaser.GameObjects.Text;
  private isWaveInProgress: boolean = false;

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

    // ----- Création des points d'apparition
    this.createSpawnPoints(map);

    // Ajout du texte pour la vague
    if (SpawnConfig.debug.showWaveInfo) {
      this.waveText = this.add.text(16, 48, '', {
        color: '#ffffff',
        backgroundColor: '#000000',
      });
      this.waveText.setScrollFactor(0);
      this.updateWaveText();
    }

    // Démarrer la première vague
    this.startNextWave();

    // ----- Ajout de la camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    if (SpawnConfig.debug.showEnemyCount) {
      this.enemyCountText = this.add.text(16, 16, '', {
        color: '#ffffff',
        backgroundColor: '#000000',
      });
      this.enemyCountText.setScrollFactor(0);
      this.updateEnemyCountText();
    }
  }

  private createSpawnPoints(map: Phaser.Tilemaps.Tilemap) {
    const spawnLayer = map.getObjectLayer('SpawnPoints');

    if (spawnLayer && spawnLayer.objects) {
      spawnLayer.objects.forEach((spawnObject) => {
        const spawnPoint = EnemySpawnFactory.createSpawnPoint(
          this,
          spawnObject.x || 0,
          spawnObject.y || 0
        );
        this.spawnPoints.push(spawnPoint);
      });
    }
  }

  private startNextWave() {
    if (this.currentWave >= SpawnConfig.waves.length) {
      console.log('Toutes les vagues sont terminées !');
      return;
    }

    const wave = SpawnConfig.waves[this.currentWave];
    this.remainingEnemies = {
      cac: wave.cacCount,
      range: wave.rangeCount,
    };
    this.isWaveInProgress = true;

    // Configurer le timer de spawn pour cette vague
    this.spawnTimer?.destroy();
    this.spawnTimer = this.time.addEvent({
      delay: wave.spawnDelay,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true,
    });

    this.updateWaveText();
  }

  private spawnEnemies() {
    if (!this.isWaveInProgress) return;

    const wave = SpawnConfig.waves[this.currentWave];

    // Choisir un point de spawn aléatoire
    const spawnPoint = Phaser.Utils.Array.GetRandom(this.spawnPoints);

    if (this.remainingEnemies.cac > 0) {
      const enemy = spawnPoint.spawnEnemy('cac');
      if (enemy) {
        this.setupEnemy(enemy);
        this.remainingEnemies.cac--;
      }
    } else if (this.remainingEnemies.range > 0) {
      const enemy = spawnPoint.spawnEnemy('range');
      if (enemy) {
        this.setupEnemy(enemy);
        this.remainingEnemies.range--;
      }
    }

    this.checkWaveCompletion();
    this.updateWaveText();
  }

  private setupEnemy(enemy: CaCEnemy | RangeEnemy) {
    enemy.setTarget(this.player);
    this.enemies.push(enemy);

    enemy.once('destroy', () => {
      this.enemies = this.enemies.filter((e) => e !== enemy);
      this.updateEnemyCountText();
    });
  }

  private checkWaveCompletion() {
    const allEnemiesSpawned =
      this.remainingEnemies.cac === 0 && this.remainingEnemies.range === 0;

    const allEnemiesDefeated = this.enemies.length === 0;

    if (allEnemiesSpawned && allEnemiesDefeated) {
      this.isWaveInProgress = false;
      this.currentWave++;
      this.startNextWave();
    }
  }

  private updateWaveText() {
    if (this.waveText) {
      const totalEnemies = {
        cac: SpawnConfig.waves[this.currentWave].cacCount,
        range: SpawnConfig.waves[this.currentWave].rangeCount,
      };

      const remainingToSpawn = {
        cac: this.remainingEnemies.cac,
        range: this.remainingEnemies.range,
      };

      const activeEnemies = this.enemies.reduce(
        (count, enemy) => {
          if (enemy instanceof CaCEnemy) count.cac++;
          if (enemy instanceof RangeEnemy) count.range++;
          return count;
        },
        { cac: 0, range: 0 }
      );

      this.waveText.setText(
        `Vague: ${this.currentWave + 1}\n` +
          `CAC: ${activeEnemies.cac}/${totalEnemies.cac} (À spawner: ${remainingToSpawn.cac})\n` +
          `RANGE: ${activeEnemies.range}/${totalEnemies.range} (À spawner: ${remainingToSpawn.range})`
      );
    }
  }

  private updateEnemyCountText() {
    if (this.enemyCountText) {
      this.enemyCountText.setText(`Ennemis actifs: ${this.enemies.length}`);
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
      if (!this.lastShotTime || this.time.now - this.lastShotTime > 500) {
        this.player.shoot();
        this.lastShotTime = this.time.now;
      }
    }
  }

  destroy() {
    this.spawnTimer?.destroy();
    this.enemyCountText?.destroy();
    this.spawnPoints.forEach((point) => point.destroy());
  }
}
