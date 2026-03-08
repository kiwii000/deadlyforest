import Phaser from 'phaser';
import { INVULNERABILITY_SECONDS, PLAYER_SPEED } from '../config/constants';

export class Player extends Phaser.GameObjects.Rectangle {
  speed = PLAYER_SPEED;
  invulnerableUntil = 0;
  torchFuel = 0;
  equippedHand: string | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 20, 26, 0x4ea1ff);
    this.setOrigin(0.5, 0.7);
    scene.add.existing(this);
  }

  move(input: Phaser.Math.Vector2, dt: number): boolean {
    const moving = input.lengthSq() > 0;
    if (moving) {
      input.normalize();
      this.x += input.x * this.speed * dt;
      this.y += input.y * this.speed * dt;
      this.fillColor = 0x3f89dd;
    } else {
      this.fillColor = 0x4ea1ff;
    }
    return moving;
  }

  canTakeDamage(now: number): boolean {
    return now >= this.invulnerableUntil;
  }

  takeHit(now: number): void {
    this.invulnerableUntil = now + INVULNERABILITY_SECONDS * 1000;
  }
}
