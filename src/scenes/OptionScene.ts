import { MusicManager } from '~/utils';

export class OptionsScene extends Phaser.Scene {
  constructor() {
    super('OptionsScene');
  }

  preload() {
    MusicManager.getInstance().preloadSceneMusic(this);
  }

  create() {
    const { width, height } = this.scale;

    // Démarrer la musique des options
    MusicManager.getInstance().playSceneMusic(this);

    // Ajout du fond d'écran
    this.add
      .image(width / 2, height / 2, 'space')
      .setDisplaySize(width, height);

    // Titre
    const title = this.add
      .text(width / 2, height * 0.1, 'CONTRÔLES', {
        fontSize: '48px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Création du conteneur pour les contrôles
    const controlsContainer = this.add.container(width / 2, height * 0.3);

    // Texte des contrôles
    const controls = [
      'DÉPLACEMENT',
      '',
      'Z / ↑ - Avancer',
      'S / ↓ - Reculer',
      'Q / ← - Gauche',
      'D / → - Droite',
      '',
      'ACTIONS',
      '',
      'ESPACE - Dash',
      'CLIC GAUCHE - Tirer',
      'R - Recharger',
    ];

    // Ajout de chaque ligne de texte
    controls.forEach((text, index) => {
      const yPos = index * 40;
      const style = {
        fontSize:
          text === 'DÉPLACEMENT' || text === 'ACTIONS' ? '32px' : '24px',
        fontFamily: 'Arial',
        color:
          text === 'DÉPLACEMENT' || text === 'ACTIONS' ? '#00ffff' : '#ffffff',
        align: 'center' as const,
        stroke: '#000000',
        strokeThickness: 2,
      };

      const controlText = this.add.text(0, yPos, text, style).setOrigin(0.5);

      controlsContainer.add(controlText);
    });

    // Bouton retour
    this.createButton('RETOUR', height * 0.85, () => {
      MusicManager.getInstance().stopCurrentMusic();
      this.scene.start('MenuScene');
    });
  }

  private createButton(text: string, y: number, callback: () => void): void {
    const buttonWidth = 280;
    const buttonHeight = 60;
    const button = this.add.container(this.scale.width / 2, y);

    const background = this.add.graphics();
    background.fillStyle(0x000080);
    background.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      15
    );
    background.fillStyle(0x0000ff);
    background.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight - 5,
      15
    );

    const buttonText = this.add
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

    button.add([background, buttonText]);
    button.setSize(buttonWidth, buttonHeight);

    button
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        background.clear();
        background.fillStyle(0x000080);
        background.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          15
        );
        background.fillStyle(0x4040ff);
        background.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight - 5,
          15
        );
        buttonText.setStyle({ fontSize: '30px' });
        this.sound.play('buttonHover');
      })
      .on('pointerout', () => {
        background.clear();
        background.fillStyle(0x000080);
        background.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          15
        );
        background.fillStyle(0x0000ff);
        background.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight - 5,
          15
        );
        buttonText.setStyle({ fontSize: '28px' });
      })
      .on('pointerdown', () => {
        this.sound.play('buttonClick');
        callback();
      });
  }
}
