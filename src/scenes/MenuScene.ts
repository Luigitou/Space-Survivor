import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private backgroundMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('space', 'assets/backgroundMainMenu.png');
    this.load.image('star', 'assets/star.png');
    this.load.audio('titleScreen', 'audio/titleScreen.ogg');
    this.load.audio('buttonHover', 'audio/hover.wav');
    this.load.audio('buttonClick', 'audio/click.wav');
    this.load.image('titleImage', 'assets/logo.png');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .image(width / 2, height / 2, 'space')
      .setDisplaySize(width, height);
    this.createStars();

    const title = this.add
      .image(width / 2, height / 4, 'titleImage')
      .setOrigin(0.5)
      .setScale(0.5);

    this.tweens.add({
      targets: title,
      scale: title.scale * 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    const baseY = height * 0.6;
    const spacing = 90;

    this.createButton('JOUER', baseY, () => this.scene.start('MainScene'));
    this.createButton('OPTIONS', baseY + spacing, () =>
      console.log('Options clicked')
    );
    this.createButton('QUITTER', baseY + spacing * 2, () =>
      console.log('Quitter clicked')
    );

    this.backgroundMusic = this.sound.add('titleScreen', {
      loop: true,
      volume: 0.2,
    });
    this.backgroundMusic.play();
  }

  private createButton(text: string, y: number, callback: () => void): void {
    const buttonWidth = 280;
    const buttonHeight = 60;
    const button = this.add.container(this.scale.width / 2, y);

    const background = this.createButtonBackground(buttonWidth, buttonHeight);
    const glow = this.createButtonGlow(buttonWidth, buttonHeight);
    const buttonText = this.createButtonText(text);

    button.add([glow, background, buttonText]);
    button.setSize(buttonWidth, buttonHeight);
    this.setButtonInteractive(button, callback);
  }

  private createButtonBackground(
    width: number,
    height: number
  ): Phaser.GameObjects.Graphics {
    const background = this.add.graphics();
    this.drawButtonBackground(background, width, height, 0x0000ff);
    return background;
  }

  private createButtonGlow(
    width: number,
    height: number
  ): Phaser.GameObjects.Graphics {
    const glow = this.add.graphics();
    glow.fillStyle(0x4040ff, 0.5);
    glow.fillRoundedRect(
      -width / 2 - 5,
      -height / 2 - 5,
      width + 10,
      height + 10,
      20
    );
    return glow;
  }

  private createButtonText(text: string): Phaser.GameObjects.Text {
    return this.add
      .text(0, 0, text, {
        fontSize: '28px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
  }

  private setButtonInteractive(
    button: Phaser.GameObjects.Container,
    callback: () => void
  ): void {
    button
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.onButtonOver(button))
      .on('pointerout', () => this.onButtonOut(button))
      .on('pointerdown', () => {
        this.sound.play('buttonClick');
        callback();
      });
  }

  private onButtonOver(button: Phaser.GameObjects.Container): void {
    const background = button.getAt(1) as Phaser.GameObjects.Graphics;
    const text = button.getAt(2) as Phaser.GameObjects.Text;
    this.drawButtonBackground(
      background,
      button.width,
      button.height,
      0x4040ff
    );
    text.setStyle({ fontSize: '30px' });
    this.sound.play('buttonHover');
  }

  private onButtonOut(button: Phaser.GameObjects.Container): void {
    const background = button.getAt(1) as Phaser.GameObjects.Graphics;
    const text = button.getAt(2) as Phaser.GameObjects.Text;
    this.drawButtonBackground(
      background,
      button.width,
      button.height,
      0x0000ff
    );
    text.setStyle({ fontSize: '28px' });
  }

  private drawButtonBackground(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    fillColor: number
  ): void {
    graphics.clear();
    graphics.fillStyle(0x000080);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
    graphics.fillStyle(fillColor);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height - 5, 15);
  }

  createStars() {
    const { width, height } = this.scale;
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.image(x, y, 'star').setScale(0.5);
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: Phaser.Math.Between(1000, 3000),
        repeat: -1,
        yoyo: true,
        x: x + Phaser.Math.Between(-5, 5),
        y: y + Phaser.Math.Between(-5, 5),
      });
    }
  }
}
