import EasyStar from 'easystarjs';

export class EasyStarManager {
  // Ajout des constantes pour les types de tuiles
  private static readonly TRAVERSABLE = 0; // Case traversable normale
  private static readonly NEAR_WALL = 1; // Case proche d'un mur
  private static readonly WALL = 2; // Mur ou obstacle
  private easystar: EasyStar.js;
  private grid: number[][] = [];

  public constructor() {
    this.easystar = new EasyStar.js();
    this.easystar.enableDiagonals();
  }

  public initializeGrid(map: Phaser.Tilemaps.Tilemap, layerName: string[]) {
    if (!map) return;

    const layerArray = layerName.map(
      (layerName) => map.getLayer(layerName)?.tilemapLayer
    );

    if (layerArray.length > 0 && !layerArray.every((layer) => layer)) {
      console.error(`Layer "${layerName}" not found in the tilemap`);
      return;
    }

    const tilesetIndex = layerArray[0]?.tileset[0].firstgid;

    if (tilesetIndex === undefined) {
      console.error('Tileset not found in the tilemap');
      return;
    }

    for (let y = 0; y < map.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < map.width; x++) {
        const tile = layerArray.map((layer) => layer!.getTileAt(x, y));
        if (tile[0]) {
          row.push(EasyStarManager.WALL);
        } else if (tile[1]) {
          row.push(EasyStarManager.WALL);
        } else {
          let isNearWall = false;
          for (const pos of this.getAdjacentPositions(x, y)) {
            const adjacentTile = layerArray.map((layer) =>
              layer!.getTileAt(pos.x, pos.y)
            );
            if (adjacentTile[0] || adjacentTile[1]) {
              isNearWall = true;
              break;
            } else {
              isNearWall = false;
            }
          }
          if (isNearWall) {
            row.push(EasyStarManager.NEAR_WALL);
          } else {
            row.push(EasyStarManager.TRAVERSABLE);
          }
        }
      }
      this.grid.push(row);
    }

    console.log(this.grid);
    this.easystar.setGrid(this.grid);
    this.easystar.setAcceptableTiles([
      EasyStarManager.TRAVERSABLE,
      EasyStarManager.NEAR_WALL,
    ]);
    this.easystar.setTileCost(EasyStarManager.TRAVERSABLE, 1);
    this.easystar.setTileCost(EasyStarManager.NEAR_WALL, 2);
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

  private getAdjacentPositions(x: number, y: number) {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ];
  }
}
