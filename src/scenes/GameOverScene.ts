import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { reason?: string }): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.add.text(centerX, centerY - 20, 'Game Over', { color: '#ff6666', fontSize: '40px' }).setOrigin(0.5);
    this.add.text(centerX, centerY + 20, data.reason ?? 'You did not survive.', { color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX, centerY + 60, 'R: Retry | M: Main Menu', { color: '#dddddd' }).setOrigin(0.5);
    this.input.keyboard?.on('keydown-R', () => this.scene.start('Play', { seed: `${Date.now()}`, slot: 1, load: false }));
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MainMenu'));
  }
}
