import EasyStar from 'easystarjs';

export class EasyStarManager {
  private easystar: EasyStar.js;
  private grid: number[][] = [];

  public constructor() {
    this.easystar = new EasyStar.js();
    this.easystar.enableDiagonals();
  }

  public initializeGrid(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string,
    acceptableTiles: number[]
  ) {
    if (!map) return;
    const layer = map.getLayer(layerName)?.tilemapLayer;

    if (!layer) {
      console.error(`Layer "${layerName}" not found in the tilemap`);
      return;
    }

    const tilesetIndex = layer.tileset[0].firstgid;

    for (let y = 0; y < map.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < map.width; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile) {
          // On met un 1 si c'est un obstacle, sinon 0
          row.push(acceptableTiles.includes(tile.index - tilesetIndex) ? 0 : 1);
        } else {
          row.push(0);
        }
      }
      this.grid.push(row);
    }

    // Configure la grille dans EasyStar
    this.easystar.setGrid(this.grid);

    // Définis quelles tuiles sont traversables
    this.easystar.setAcceptableTiles(acceptableTiles);
  }

  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    callback: (
      path: {
        x: number;
        y: number;
      }[]
    ) => void
  ) {
    this.easystar.findPath(startX, startY, targetX, targetY, callback);
    this.easystar.calculate();
  }
}
