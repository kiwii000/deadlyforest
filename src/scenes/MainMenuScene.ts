import Phaser from 'phaser';
import { listSaves } from '../systems/saveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  private startNewGame(): void {
    const seed = `${Date.now()}`;
    this.scene.start('Play', { seed, slot: 1, load: false });
  }

  private loadSlot1(): void {
    this.scene.start('Play', { seed: 'loaded', slot: 1, load: true });
  }

  private quitGame(): void {
    window.close();
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

    const newGameButton = this.add
      .text(centerX, 320, 'New Game', { color: '#ffffff', fontSize: '22px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const loadButton = this.add
      .text(centerX, 360, 'Load Slot 1', { color: '#ffffff', fontSize: '22px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const quitButton = this.add
      .text(centerX, 400, 'Quit', { color: '#ffffff', fontSize: '22px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add.text(centerX, 440, 'Click button if keyboard input is blocked', {
      color: '#c7c7c7',
      fontSize: '13px'
    }).setOrigin(0.5);

    newGameButton.on('pointerdown', this.startNewGame, this);
    loadButton.on('pointerdown', this.loadSlot1, this);
    quitButton.on('pointerdown', this.quitGame, this);

    this.input.keyboard?.on('keydown-N', this.startNewGame, this);
    this.input.keyboard?.on('keydown-L', this.loadSlot1, this);
    this.input.keyboard?.on('keydown-Q', this.quitGame, this);
    this.input.keyboard?.on('keydown-ENTER', this.startNewGame, this);
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'KeyN' || event.code === 'Enter') {
        this.startNewGame();
      } else if (event.code === 'KeyL') {
        this.loadSlot1();
      }
    });
  }
}
