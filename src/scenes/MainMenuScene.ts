import Phaser from 'phaser';
import { listSaves } from '../systems/saveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const centerX = this.scale.width / 2;
    this.add.text(centerX, 100, 'Deadly Forest', { color: '#ffffff', fontSize: '36px' }).setOrigin(0.5);
    this.add.text(centerX, 160, 'N: New Game  |  L: Load Slot 1  |  Q: Quit', {
      color: '#dddddd',
      fontSize: '16px'
    }).setOrigin(0.5);

    const saves = listSaves();
    const saveText = saves.length === 0 ? 'No saves found.' : saves.map((s) => `Slot ${s.slot}: Day ${s.day} (${s.status})`).join('\n');
    this.add.text(centerX, 220, saveText, { color: '#a9d7ff', align: 'center' }).setOrigin(0.5, 0);

    this.input.keyboard?.on('keydown-N', () => {
      const seed = `${Date.now()}`;
      this.scene.start('Play', { seed, slot: 1, load: false });
    });
    this.input.keyboard?.on('keydown-L', () => {
      this.scene.start('Play', { seed: 'loaded', slot: 1, load: true });
    });
    this.input.keyboard?.on('keydown-Q', () => {
      window.close();
    });
  }
}
