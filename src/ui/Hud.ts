import Phaser from 'phaser';

export class Hud {
  text: Phaser.GameObjects.Text;
  message: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, '', { color: '#ffffff', fontSize: '14px' }).setScrollFactor(0);
    this.message = scene.add.text(8, 92, '', { color: '#ffdf88', fontSize: '14px' }).setScrollFactor(0);
  }

  setStats(lines: string): void {
    this.text.setText(lines);
  }

  flash(message: string): void {
    this.message.setText(message);
  }
}
