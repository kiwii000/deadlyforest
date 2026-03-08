import Phaser from 'phaser';
import type { EnemyData } from '../core/types';

export class Enemy extends Phaser.GameObjects.Rectangle {
  dataModel: EnemyData;
  spawnX: number;
  spawnY: number;
  cooldown = 0;

  constructor(scene: Phaser.Scene, data: EnemyData) {
    super(scene, data.x, data.y, 18, 18, 0xaa3344);
    this.dataModel = data;
    this.spawnX = data.x;
    this.spawnY = data.y;
    this.setOrigin(0.5, 0.65);
    scene.add.existing(this);
  }
}
