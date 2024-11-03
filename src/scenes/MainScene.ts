import Phaser from 'phaser';
import {
  BasicEnemy,
  BasicEntity,
  CaCEnemy,
  RangeEnemy,
  Weapon,
  BossEnemy,
} from '~/objects';
import { CustomScene } from '~/scenes/CustomScene';
import { EasyStarManager } from '~/utils';
import { EnemySpawnPoint } from '~/objects/EnemySpawnPoint';
import { EnemySpawnFactory } from '~/factories/EnemySpawnFactory';
import { SpawnConfig } from '~/config';
import { HealthBar } from '~/objects/HealthBar';

export class MainScene extends CustomScene {
  public crosshair!: Phaser.GameObjects.Sprite;
  public easystarManager!: EasyStarManager;
  private player!: BasicEntity;
  private collisionLayer: Array<Phaser.Tilemaps.TilemapLayer | null> = [];
  private enemies: Array<BasicEnemy> = [];
  private leftMouseDown: boolean = false;
  private lastShotTime?: number;
  private timerText?: Phaser.GameObjects.Text;
  private initialTime: number = 0;
  private spawnPoints: EnemySpawnPoint[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private currentWave: number = 0;
  private remainingEnemies: { cac: number; range: number; boss: number } = {
    cac: 0,
    range: 0,
    boss: 0,
  };
  private waveText?: Phaser.GameObjects.Text;
  private isWaveInProgress: boolean = false;
  private waveStartTime: number = 0;
  private waveTimer?: Phaser.Time.TimerEvent;
  private weapon!: Weapon;
  private ammoText!: Phaser.GameObjects.Text;
  private healthBar!: HealthBar;

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
    this.load.image('boss', 'assets/sprites/boss.png');
  }

  create() {
    this.initializeScene();

    super.create();

    // Création du crosshair
    this.crosshair = this.add.sprite(50, 50, 'crosshair');
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
    this.timerText = this.add.text(
      this.crosshair.x,
      this.crosshair.y,
      'Time: 0',
      {
        fontSize: '32px',
        color: '#FFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    );
    // Masquer le texte du timer
    this.timerText.setVisible(false);
    this.hudContainer.add(this.timerText);

    // ----- Initialisation du chronomètre
    this.initialTime = 0;

    // ----- Initialisation de l'arme du joueur
    this.weapon = new Weapon(this, 'rifle', this.crosshair);

    // ----- Ajout du texte d'ammo
    this.ammoText = this.add.text(
      16,
      16,
      `${this.weapon.getCurrentAmmo()} / ${this.weapon.getMaxAmmo()}`,
      {
        color: '#ffffff',
        fontSize: '14px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }
    );

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

    // Ajout du texte pour la vague
    if (SpawnConfig.debug.showWaveInfo) {
      this.waveText = this.add
        .text(16, 16, '', {
          color: '#00ffff', // Cyan futuriste
          backgroundColor: '#000033aa', // Bleu foncé semi-transparent
          padding: { x: 15, y: 10 },
          fontSize: '14px',
          fontFamily: 'Courier New', // Police monospace pour un look plus technique
          align: 'left',
          fixedWidth: 300,
          lineSpacing: 5,
        })
        .setStroke('#003333', 2); // Contour pour effet holographique
      this.waveText.setScrollFactor(0);
      this.updateWaveText();
    }

    // Démarrer la première vague
    this.startNextWave();

    // ----- Ajout de la camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    this.healthBar = new HealthBar(this);
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
    this.enemies.forEach((enemy) => enemy.update());
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
    this.ammoText.x = this.crosshair.x + 20;
    this.ammoText.y = this.crosshair.y - this.ammoText.height;
    this.ammoText.setText(
      `${this.weapon.getCurrentAmmo()} / ${this.weapon.getMaxAmmo()}`
    );

    if (this.healthBar && this.player) {
      this.healthBar.update(
        this.player.getCurrentHealth(),
        this.player.getMaxHealth()
      );
    }
  }

  public destroy() {
    // Arrêter tous les timers
    this.spawnTimer?.destroy();
    this.waveTimer?.destroy();

    // Arrêter la scène complètement
    this.scene.stop();
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
    const wave = SpawnConfig.getWave(this.currentWave);
    this.remainingEnemies = {
      cac: wave.cacCount,
      range: wave.rangeCount,
      boss: wave.bossCount || 0,
    };
    this.isWaveInProgress = true;
    this.waveStartTime = this.time.now;

    // Configurer le timer de spawn
    this.spawnTimer?.destroy();
    this.spawnTimer = this.time.addEvent({
      delay: wave.spawnDelay,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true,
    });

    // Configurer le timer de la vague UNIQUEMENT si requireAllDefeated est false
    this.waveTimer?.destroy();
    if (wave.waveDuration && !wave.requireAllDefeated) {
      this.waveTimer = this.time.addEvent({
        delay: wave.waveDuration,
        callback: () => this.checkWaveCompletion(true),
        callbackScope: this,
      });
    }

    this.updateWaveText();
  }

  private spawnEnemies() {
    if (!this.isWaveInProgress) return;

    const wave = SpawnConfig.getWave(this.currentWave);

    // Choisir un point de spawn aléatoire
    const spawnPoint = Phaser.Utils.Array.GetRandom(this.spawnPoints);

    if (this.remainingEnemies.boss > 0) {
      const enemy = spawnPoint.spawnEnemy('boss');
      if (enemy) {
        this.setupEnemy(enemy);
        this.remainingEnemies.boss--;
      }
    } else if (this.remainingEnemies.cac > 0) {
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

  private setupEnemy(enemy: CaCEnemy | RangeEnemy | BossEnemy) {
    enemy.setTarget(this.player);
    this.enemies.push(enemy);
    this.updateWaveText();

    enemy.once('destroy', () => {
      this.enemies = this.enemies.filter((e) => e !== enemy);
      this.updateWaveText();
      this.checkWaveCompletion();
    });
  }

  private checkWaveCompletion(forceNextWave: boolean = false) {
    const wave = SpawnConfig.getWave(this.currentWave);
    const allEnemiesSpawned =
      this.remainingEnemies.cac === 0 &&
      this.remainingEnemies.range === 0 &&
      this.remainingEnemies.boss === 0;

    const allEnemiesDefeated = this.enemies.length === 0;
    const timeExpired = wave.waveDuration
      ? this.time.now - this.waveStartTime >= wave.waveDuration
      : false;

    // Si requireAllDefeated est true, on doit attendre que tous les ennemis soient vaincus
    if (wave.requireAllDefeated) {
      if (allEnemiesSpawned && allEnemiesDefeated) {
        this.isWaveInProgress = false;
        this.currentWave++;
        this.startNextWave();
      }
    } else {
      // Sinon, on peut passer à la vague suivante si le temps est écoulé
      if (allEnemiesSpawned && (forceNextWave || timeExpired)) {
        this.isWaveInProgress = false;
        this.currentWave++;
        this.startNextWave();
      }
    }
  }

  private updateWaveText() {
    if (!this.scene.isActive() || !this.waveText?.active) return;

    const wave = SpawnConfig.getWave(this.currentWave);
    const timeRemaining =
      !wave.requireAllDefeated && wave.waveDuration
        ? Math.max(
            0,
            Math.ceil(
              (wave.waveDuration - (this.time.now - this.waveStartTime)) / 1000
            )
          )
        : null;

    const activeEnemies = this.enemies.reduce(
      (count, enemy) => {
        if (!enemy.active) return count;
        if (enemy instanceof CaCEnemy) count.cac++;
        if (enemy instanceof RangeEnemy) count.range++;
        if (enemy instanceof BossEnemy) count.boss++;
        return count;
      },
      { cac: 0, range: 0, boss: 0 }
    );

    const minutes = Math.floor(this.initialTime / 60);
    const seconds = this.initialTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.waveText.setText(
      `[ VAGUE ${this.currentWave + 1} ]\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `⏱️ TEMPS: ${timeString}\n` +
        `UNITÉS HOSTILES:\n` +
        `◢ UNITÉS MÊLÉE    [${activeEnemies.cac}/${wave.cacCount}]\n` +
        `◢ UNITÉS DISTANCE [${activeEnemies.range}/${wave.rangeCount}]\n` +
        `◢ UNITÉ BOSS      [${activeEnemies.boss}/${wave.bossCount || 0}]\n\n` +
        (timeRemaining !== null ? `TEMPS RESTANT: ${timeRemaining}s\n\n` : '') +
        `${
          wave.requireAllDefeated
            ? '❗ÉLIMINATION TOTALE REQUISE❗'
            : '🚀 PROGRESSION AUTOMATIQUE 🚀'
        }\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✨ NIVEAU JOUEUR: ${this.player.getLevel()} ✨`
    );
  }

  public restartScene() {
    this.events.removeAllListeners();

    this.scene.stop();

    this.scene.start('MainScene');
  }

  private initializeScene() {
    this.enemies = [];
    this.collisionLayer = [];
    this.spawnPoints = [];
    this.leftMouseDown = false;
    this.initialTime = 0;
    this.currentWave = 0;
    this.remainingEnemies = { cac: 0, range: 0, boss: 0 };
    this.isWaveInProgress = false;
    this.waveStartTime = 0;
  }
}
