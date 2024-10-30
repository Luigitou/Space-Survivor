// VectorField.ts

import { MapConfig } from '~/config';

export class VectorField {
  private field: Phaser.Math.Vector2[][];
  private width: number;
  private height: number;
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    // Initialisation du champ vectoriel
    this.field = [];
    for (let x = 0; x < width; x++) {
      this.field[x] = [];
      for (let y = 0; y < height; y++) {
        this.field[x][y] = new Phaser.Math.Vector2(0, 0);
      }
    }

    this.graphics = this.scene.add.graphics();
  }

  // Génère le champ vectoriel à partir de la position cible
  public generate(targetX: number, targetY: number, walkableMap: boolean[][]) {
    // Utilisation de l'algorithme de propagation d'onde (Wave Propagation) pour remplir le champ
    const queue: { x: number; y: number }[] = [];
    const visited: boolean[][] = [];

    for (let x = 0; x < this.width; x++) {
      visited[x] = [];
      for (let y = 0; y < this.height; y++) {
        visited[x][y] = false;
        this.field[x][y].set(0, 0);
      }
    }

    const targetTileX = Math.floor(targetX / MapConfig.tileSize);
    const targetTileY = Math.floor(targetY / MapConfig.tileSize);

    queue.push({ x: targetTileX, y: targetTileY });
    visited[targetTileX][targetTileY] = true;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.getNeighbors(current.x, current.y, walkableMap);

      for (const neighbor of neighbors) {
        if (!visited[neighbor.x][neighbor.y]) {
          visited[neighbor.x][neighbor.y] = true;
          queue.push(neighbor);

          // Calcul du vecteur depuis le voisin vers le courant
          const dir = new Phaser.Math.Vector2(
            current.x - neighbor.x,
            current.y - neighbor.y
          ).normalize();

          this.field[neighbor.x][neighbor.y] = dir;
        }
      }
    }
    this.visualize();
  }

  // Retourne le vecteur à la position donnée
  public getVectorAt(worldX: number, worldY: number): Phaser.Math.Vector2 {
    const tileX = Math.floor(worldX / MapConfig.tileSize);
    const tileY = Math.floor(worldY / MapConfig.tileSize);

    if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
      return this.field[tileX][tileY];
    } else {
      return new Phaser.Math.Vector2(0, 0);
    }
  }

  // Méthode pour activer ou désactiver la visualisation
  public setVisible(visible: boolean) {
    this.graphics.setVisible(visible);
  }

  // Retourne les voisins accessibles d'une tuile
  private getNeighbors(x: number, y: number, walkableMap: boolean[][]) {
    const neighbors: { x: number; y: number }[] = [];
    const directions = [
      { x: 1, y: 0 }, // Droite
      { x: -1, y: 0 }, // Gauche
      { x: 0, y: 1 }, // Bas
      { x: 0, y: -1 }, // Haut
      { x: 1, y: 1 }, // Bas-Droite
      { x: -1, y: 1 }, // Bas-Gauche
      { x: 1, y: -1 }, // Haut-Droite
      { x: -1, y: -1 }, // Haut-Gauche
    ];

    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;

      if (
        nx >= 0 &&
        nx < this.width &&
        ny >= 0 &&
        ny < this.height &&
        walkableMap[nx][ny]
      ) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  // Visualisation des vecteurs du champ
  private visualize() {
    // Effacer le graphique précédent
    this.graphics.clear();

    // Définir le style du trait
    this.graphics.lineStyle(1, 0x00ff00, 0.5); // Vert avec 50% d'opacité

    const tileSize = MapConfig.tileSize;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const vector = this.field[x][y];

        if (vector.length() > 0) {
          const startX = x * tileSize + tileSize / 2;
          const startY = y * tileSize + tileSize / 2;

          const endX = startX + vector.x * (tileSize / 2);
          const endY = startY + vector.y * (tileSize / 2);

          // Dessiner une ligne du centre de la tuile dans la direction du vecteur
          this.graphics.strokeLineShape(
            new Phaser.Geom.Line(startX, startY, endX, endY)
          );

          // Dessiner une petite flèche à la fin du vecteur
          const arrowSize = 4;
          const angle = vector.angle();

          const arrowLeftX =
            endX + Math.cos(angle + Math.PI - Math.PI / 6) * arrowSize;
          const arrowLeftY =
            endY + Math.sin(angle + Math.PI - Math.PI / 6) * arrowSize;

          const arrowRightX =
            endX + Math.cos(angle + Math.PI + Math.PI / 6) * arrowSize;
          const arrowRightY =
            endY + Math.sin(angle + Math.PI + Math.PI / 6) * arrowSize;

          this.graphics.strokeLineShape(
            new Phaser.Geom.Line(endX, endY, arrowLeftX, arrowLeftY)
          );
          this.graphics.strokeLineShape(
            new Phaser.Geom.Line(endX, endY, arrowRightX, arrowRightY)
          );
        }
      }
    }
  }
}
