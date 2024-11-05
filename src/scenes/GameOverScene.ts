import Phaser from 'phaser';
import { MusicManager } from '~/utils';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  preload() {
    MusicManager.getInstance().preloadSceneMusic(this);
  }

  create() {
    const { width, height } = this.scale;

    // Démarrer la musique de game over
    MusicManager.getInstance().playSceneMusic(this);

    // Ajout d'un fond semi-transparent noir
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);

    // Texte "GAME OVER"
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ff0000',
      align: 'center',
    });
    gameOverText.setOrigin(0.5);

    // Animation du texte
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Création des boutons
    this.createButton(width / 2, height / 2 + 50, 'RÉESSAYER', () => {
      MusicManager.getInstance().stopCurrentMusic();
      this.scene.stop('GameOverScene');
      this.scene.stop('MainScene');
      this.scene.start('MainScene');
    });

    this.createButton(width / 2, height / 2 + 130, 'MENU PRINCIPAL', () => {
      MusicManager.getInstance().stopCurrentMusic();
      this.scene.stop('GameOverScene');
      this.scene.stop('MainScene');
      this.scene.start('MenuScene');
    });
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ) {
    const button = this.add.container(x, y);

    // Fond du bouton
    const background = this.add.graphics();
    background.fillStyle(0x000080);
    background.fillRoundedRect(-140, -30, 280, 60, 15);
    background.fillStyle(0x0000ff);
    background.fillRoundedRect(-140, -30, 280, 55, 15);

    // Texte du bouton
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
    });
    buttonText.setOrigin(0.5);

    button.add([background, buttonText]);

    // Interactivité
    background.setInteractive(
      new Phaser.Geom.Rectangle(-140, -30, 280, 60),
      Phaser.Geom.Rectangle.Contains
    );

    background
      .on('pointerover', () => {
        background.clear();
        background.fillStyle(0x000080);
        background.fillRoundedRect(-140, -30, 280, 60, 15);
        background.fillStyle(0x4040ff);
        background.fillRoundedRect(-140, -30, 280, 55, 15);
        buttonText.setStyle({ fontSize: '30px' });
        this.input.setDefaultCursor('pointer');
      })
      .on('pointerout', () => {
        background.clear();
        background.fillStyle(0x000080);
        background.fillRoundedRect(-140, -30, 280, 60, 15);
        background.fillStyle(0x0000ff);
        background.fillRoundedRect(-140, -30, 280, 55, 15);
        buttonText.setStyle({ fontSize: '28px' });
        this.input.setDefaultCursor('default');
      })
      .on('pointerdown', callback);
  }
}
