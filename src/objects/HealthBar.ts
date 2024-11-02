export class HealthBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private barContainer: Phaser.GameObjects.Container;
  private bar: Phaser.GameObjects.Graphics;
  private healthText: Phaser.GameObjects.Text;
  private overflowBars: Phaser.GameObjects.Graphics[];
  private width: number;
  private height: number;
  private x: number;
  private y: number;

  private readonly SPACE_COLORS: Array<{
    main: number;
    glow: number;
    pulse: number;
  }> = [
    {
      main: 0x00b3b3, // Cyan
      glow: 0x00cccc,
      pulse: 0x009999,
    },
    {
      main: 0xff6699, // Rose
      glow: 0xff99aa,
      pulse: 0xff5588,
    },
    {
      main: 0xffdd00, // Or
      glow: 0xffee33,
      pulse: 0xffcc00,
    },
    {
      main: 0x00cc66, // Vert
      glow: 0x00dd88,
      pulse: 0x00bb55,
    },
  ];

  constructor(scene: Phaser.Scene, width: number = 250, height: number = 30) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.x = scene.cameras.main.width - width - 30;
    this.y = 25;

    // Container principal
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);

    // Container pour les barres
    this.barContainer = scene.add.container(0, 0);

    // Initialisation des composants
    this.background = scene.add.graphics();
    this.bar = scene.add.graphics();

    // Texte holographique
    this.healthText = scene.add
      .text(this.x + 10, this.y - 15, 'SHIELD ENERGY', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#00ffff',
      })
      .setStroke('#003333', 2);

    // Barres de débordement
    this.overflowBars = [];

    // Configuration des containers
    this.container.add([this.barContainer, this.healthText]);
    this.barContainer.add([this.background, this.bar]);

    this.drawBackground();
  }

  private drawBackground(): void {
    this.background.clear();

    // Contours
    this.background.lineStyle(2, 0x00ffff, 0.3);
    this.background.fillStyle(0x000033, 0.6);

    // Rectangle de la barre
    const points = [
      { x: this.x, y: this.y }, // Haut gauche
      { x: this.x + this.width, y: this.y }, // Haut droite
      { x: this.x + this.width, y: this.y + this.height }, // Bas droite
      { x: this.x, y: this.y + this.height }, // Bas gauche
    ];

    // Dessin du fond
    this.background.beginPath();
    this.background.moveTo(points[0].x, points[0].y);
    points.forEach((point) => this.background.lineTo(point.x, point.y));
    this.background.closePath();
    this.background.fillPath();
    this.background.strokePath();

    // Lignes technologiques (les barres verticales)
    this.background.lineStyle(1, 0x00ffff, 0.2);
    for (let i = 20; i < this.width; i += 20) {
      this.background.beginPath();
      this.background.moveTo(this.x + i, this.y);
      this.background.lineTo(this.x + i, this.y + this.height);
      this.background.strokePath();
    }
  }

  private drawHealthBar(
    graphics: Phaser.GameObjects.Graphics,
    percentage: number,
    colors: { main: number; glow: number; pulse: number }
  ): void {
    const padding = 3;
    const totalWidth = this.width - padding * 2;
    const barWidth = totalWidth * percentage;
    const startX = this.x + padding;

    graphics.clear();
    if (percentage <= 0) return;

    // Lueur
    graphics.lineStyle(6, colors.glow, 0.2);
    graphics.strokeRect(
      startX - 1,
      this.y + padding - 1,
      barWidth + 2,
      this.height - padding * 2 + 2
    );

    const steps = 20;
    const stepWidth = barWidth / steps;

    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const color = this.lerpColor(colors.main, colors.glow, ratio);
      graphics.fillStyle(color, 1);
      graphics.fillRect(
        startX + i * stepWidth,
        this.y + padding,
        stepWidth + 1,
        this.height - padding * 2
      );
    }

    // Pulse
    graphics.lineStyle(2, colors.pulse, 0.5);
    graphics.strokeRect(
      startX,
      this.y + padding,
      barWidth,
      this.height - padding * 2
    );

    // Pulse
    const time = this.scene.time.now / 1000;
    for (let i = 0; i < barWidth; i += 10) {
      const alpha = 0.5 + Math.sin(time * 5 + i * 0.1) * 0.5;
      graphics.lineStyle(1, colors.pulse, alpha);
      const x = startX + i;
      graphics.beginPath();
      graphics.moveTo(x, this.y + padding);
      graphics.lineTo(x, this.y + this.height - padding);
      graphics.strokePath();
    }

    // Brillance
    graphics.lineStyle(2, colors.pulse, 0.8);
    graphics.beginPath();
    graphics.moveTo(startX, this.y + padding);
    graphics.lineTo(startX + barWidth, this.y + padding);
    graphics.strokePath();
  }

  // Interpolation des couleurs
  private lerpColor(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.floor(r1 + (r2 - r1) * ratio);
    const g = Math.floor(g1 + (g2 - g1) * ratio);
    const b = Math.floor(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
  }

  update(currentHealth: number, baseMaxHealth: number): void {
    const baseHealthPercent = Math.min(currentHealth / baseMaxHealth, 1);

    // Couleurs différentes selon le niveau de santé
    let colors;
    if (baseHealthPercent > 0.7) {
      colors = {
        main: 0x00ff88, // Vert
        glow: 0x00ffaa,
        pulse: 0x00ff99,
      };
    } else if (baseHealthPercent > 0.3) {
      colors = {
        main: 0xffaa00, // Orange
        glow: 0xffcc00,
        pulse: 0xffbb00,
      };
    } else {
      colors = {
        main: 0xff3366, // Rouge
        glow: 0xff4477,
        pulse: 0xff2255,
      };
    }

    this.drawHealthBar(this.bar, baseHealthPercent, colors);

    const totalHealthPercentage = Math.floor(
      (currentHealth / baseMaxHealth) * 100
    );
    this.healthText.setText(`SHIELD ENERGY: ${totalHealthPercentage}%`);

    // Calcul du nombre de barres d'overflow nécessaires
    const neededBars = Math.ceil(currentHealth / baseMaxHealth) - 1;

    // Création dynamique des barres (si nécessaire)
    while (this.overflowBars.length < neededBars) {
      const newBar = this.scene.add.graphics();
      this.overflowBars.push(newBar);
      this.barContainer.add(newBar);
    }

    // Nettoyage des barres en excès
    while (this.overflowBars.length > neededBars) {
      const bar = this.overflowBars.pop();
      bar?.destroy();
    }

    // Réinitialisation et dessin des barres
    this.overflowBars.forEach((bar) => bar.clear());

    for (let i = 0; i < this.overflowBars.length; i++) {
      const overflowAmount = currentHealth - baseMaxHealth * (i + 1);
      const overflowPercent = Math.min(overflowAmount / baseMaxHealth, 1);

      if (overflowPercent > 0) {
        const colorIndex = i % this.SPACE_COLORS.length;
        this.drawHealthBar(
          this.overflowBars[i],
          overflowPercent,
          this.SPACE_COLORS[colorIndex]
        );
      }
    }
  }

  destroy(): void {
    this.container.destroy();
  }
}
