import { BasicEntity } from './BasicEntity';
import { XpConfig } from '~/config';

export class Xp extends Phaser.Physics.Matter.Sprite {
  player!: BasicEntity;
  private elapsedTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene.matter.world, x, y, texture);
    this.setActive(true);
    this.setDisplaySize(XpConfig.displaySize, XpConfig.displaySize);
    this.setCircle(XpConfig.hitboxSize);
    scene.add.existing(this);

    // VOIR POUR AJOUTER UNE TEXTURE DYNAMIQUE A L'XP PAR RAPPORT A L'XP QUELLE DONNE

    // Configuration de l'événement de collision
    this.scene.matter.world.on('collisionstart', (event: any) => {
      event.pairs.forEach((pair: any) => {
        const { bodyA, bodyB } = pair;

        // Vérifie si l'une des entités impliquées est l'XP et l'autre le joueur
        // BodyA est le joueur, bodyB est l'XP :)
        if (
          (bodyA === this.body && bodyB.gameObject instanceof BasicEntity) ||
          (bodyB === this.body && bodyA.gameObject instanceof BasicEntity)
        ) {
          this.collect(bodyA.gameObject as BasicEntity);
        }
      });
    });
  }

  // met a jour le temps écoulé pour avoir le multiplicateur d'xp
  setElapsedTime(time: number) {
    this.elapsedTime = time;
  }

  private collect(player: BasicEntity) {
    // Ajoute de l'XP au joueur avec un multiplicateur basé sur le temps passé
    // Voir pour ajuster le multiplicateur
    player.addXp(
      XpConfig.xpValue * (this.elapsedTime > 600 ? this.elapsedTime / 600 : 1)
    );
    this.destroy();
  }
}
