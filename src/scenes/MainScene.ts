import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  preload() {
    this.load.setBaseURL('https://cdn.phaserfiles.com/v385');

    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
  }

  create() {
    this.updateWorldBounds();

    this.add.image(400, 300, 'sky');

    const particles = this.add.particles(0, 0, 'red', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
    });

    const logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);

    this.scale.on('resize', this.resize, this);
  }

  updateWorldBounds() {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
  }

  resize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.physics.world.setBounds(0, 0, width, height);
  }
}
