import Phaser from 'phaser';
import { listSaves } from '../systems/saveSystem';

export class MainMenuScene extends Phaser.Scene {
  private startNewGame(): void {
    const seed = `${Date.now()}`;
    this.scene.start('Play', { seed, slot: 1, load: false });
  }

  private loadGame(): void {
    this.scene.start('Play', { seed: 'loaded', slot: 1, load: true });
  }

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

    const newGameButton = this.add
      .text(centerX, 320, 'New Game', { color: '#ffffff', fontSize: '28px', backgroundColor: '#2a5a2f', padding: { x: 18, y: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    newGameButton.on('pointerover', () => newGameButton.setStyle({ backgroundColor: '#3d7d44' }));
    newGameButton.on('pointerout', () => newGameButton.setStyle({ backgroundColor: '#2a5a2f' }));
    newGameButton.on('pointerup', () => this.startNewGame());

    const loadButton = this.add
      .text(centerX, 380, 'Load Slot 1', { color: '#ffffff', fontSize: '24px', backgroundColor: '#384d7f', padding: { x: 16, y: 8 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    loadButton.on('pointerover', () => loadButton.setStyle({ backgroundColor: '#5068a1' }));
    loadButton.on('pointerout', () => loadButton.setStyle({ backgroundColor: '#384d7f' }));
    loadButton.on('pointerup', () => this.loadGame());

    const saves = listSaves();
    const saveText = saves.length === 0 ? 'No saves found.' : saves.map((s) => `Slot ${s.slot}: Day ${s.day} (${s.status})`).join('\n');
    this.add.text(centerX, 220, saveText, { color: '#a9d7ff', align: 'center' }).setOrigin(0.5, 0);

    this.input.keyboard?.on('keydown-N', () => this.startNewGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startNewGame());
    this.input.keyboard?.on('keydown-L', () => {
      this.loadGame();
    });
    this.input.keyboard?.on('keydown-Q', () => {
      window.close();
    });
  }
}
