import { PlayerStats } from '~/objects/PlayerStats';
import { playerBuffConfig, weaponsBuffConfig } from '~/config';
import { playerBuffConfigType, weaponsBuffConfigType } from '~/config';
import { Weapon } from '~/objects';

export class LevelUpScene extends Phaser.Scene {
  private playerStats!: PlayerStats;
  private weapon!: Weapon;
  private selectedStat: playerBuffConfigType[] | weaponsBuffConfigType[] = [];
  constructor() {
    super({ key: 'LevelUpScene' });
  }
  init(data: { playerStats: PlayerStats; weapon: Weapon }) {
    this.weapon = data.weapon;
    this.playerStats = data.playerStats;
  }

  create() {
    const { width, height } = this.scale;

    this.shuffleStats();

    const background = this.add.rectangle(
      width / 2,
      height / 2,
      width * 0.9,
      height * 0.9,
      0x000000,
      0.5
    );
    background.setOrigin(0.5);
    background.setDepth(-1);

    const buttonWidth = width * 0.2;
    const buttonHeight = height * 0.6;
    const buttonY = height / 2;

    this.createStatButton(
      width / 2 - buttonWidth - 10,
      buttonY,
      buttonWidth,
      buttonHeight,
      this.selectedStat[0]
    );
    this.createStatButton(
      width / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      this.selectedStat[1]
    );
    this.createStatButton(
      width / 2 + buttonWidth + 10,
      buttonY,
      buttonWidth,
      buttonHeight,
      this.selectedStat[2]
    );
    this.createCloseButton(width / 2, height - 50);
    this.input.setDefaultCursor('default');

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) {
        this.input.setDefaultCursor('default');
      }
    });
  }

  private shuffleStats() {
    const allStats = { ...playerBuffConfig, ...weaponsBuffConfig };
    const stats = Object.keys(allStats) as Array<keyof typeof allStats>;
    this.selectedStat = Phaser.Utils.Array.Shuffle(stats)
      .slice(0, 3)
      .map((key) => allStats[key]);
    console.log(this.selectedStat);
  }

  private createStatButton(
    x: number,
    y: number,
    width: number,
    height: number,
    shuffledStats: playerBuffConfigType
  ) {
    const isMaxed = this.playerStats.isStatAlreadyMaxed(shuffledStats.name);
    const weaponAleadyHaveMod =
      shuffledStats.cat === 'weapons' &&
      this.weapon.getWeaponMods(
        shuffledStats.name.charAt(0).toLowerCase() + shuffledStats.name.slice(1)
      );
    console.log(shuffledStats.name + 'name');
    console.log(weaponAleadyHaveMod);

    const button = this.add.rectangle(x, y, width, height, 0x0000ff);
    button.setOrigin(0.5);

    const buttonText = this.add
      .text(
        x,
        y - height / 4,
        Phaser.Utils.String.UppercaseFirst(shuffledStats.name),
        {
          fontSize: '32px',
          color: '#FFF',
          wordWrap: { width: width - 20 },
          align: 'center',
        }
      )
      .setOrigin(0.5);
    buttonText.setScale(Math.min(1, width / buttonText.width));

    const buttonDescription = this.add
      .text(x, y, shuffledStats.description, {
        fontSize: '20px',
        color: '#FFF',
        wordWrap: { width: width - 20 },
        align: 'center',
      })
      .setOrigin(0.5);

    const buttonGain = this.add
      .text(x, y + height / 4, `Gain: ${shuffledStats.gain}`, {
        fontSize: '24px',
        color: '#FFF',
        wordWrap: { width: width - 20 },
        align: 'center',
      })
      .setOrigin(0.5);
    if (weaponAleadyHaveMod) {
      const weaponMaxModsText = this.add
        .text(x, y + height / 2, 'Weapon Aleady Have this Mod', {
          fontSize: '28px',
          color: '#FF0000',
          wordWrap: { width: width - 20 },
          align: 'center',
        })
        .setOrigin(0.5);
    } else if (isMaxed) {
      const maxedText = this.add
        .text(x, y + height / 2, 'Maxed', {
          fontSize: '28px',
          color: '#FF0000',
          wordWrap: { width: width - 20 },
          align: 'center',
        })
        .setOrigin(0.5);
    } else {
      button
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectStat(shuffledStats);
        })
        .on('pointerover', () => {
          this.input.setDefaultCursor('pointer');
        })
        .on('pointerout', () => {
          this.input.setDefaultCursor('default');
        });
    }
  }

  private createCloseButton(x: number, y: number) {
    const button = this.add.rectangle(x, y, 100, 50, 0xff0000);
    button.setOrigin(0.5);

    const buttonText = this.add
      .text(x, y, 'Close', {
        fontSize: '24px',
        color: '#FFF',
      })
      .setOrigin(0.5);

    button
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.closeLevelUpScene();
      })
      .on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
      })
      .on('pointerout', () => {
        this.input.setDefaultCursor('default');
      });
  }

  private closeLevelUpScene() {
    this.scene.stop();
    this.scene.resume('MainScene');
    this.input.setDefaultCursor('none');
  }

  private selectStat(stat: playerBuffConfigType | weaponsBuffConfigType) {
    const buffName = stat.name;
    if (stat.cat === 'player') {
      if (this.playerStats.currentStatLevels[buffName] !== undefined) {
        this.playerStats.buffStats(stat);
        console.log(
          `Selected buff: ${buffName}, new value: ${this.playerStats[stat.type]}`
        );
      } else {
        console.error(`Buff ${buffName} does not exist in PlayerStats`);
      }
    } else if (stat.cat === 'weapons') {
      if ('effects' in stat) {
        this.weapon.addMod(stat);
        console.log(`Selected weapon buff: ${buffName}`);
      }
    }

    this.scene.stop();
    this.scene.resume('MainScene');

    this.input.setDefaultCursor('none');
  }
}
