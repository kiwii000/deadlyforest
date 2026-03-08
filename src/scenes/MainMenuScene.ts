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

  private createMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.text(x, y, label, {
      color: '#ffffff',
      backgroundColor: '#2c2c2c',
      fontSize: '22px',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setStyle({ backgroundColor: '#464646' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#2c2c2c' }));
    button.on('pointerdown', onClick);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    this.add.text(centerX, 100, 'Deadly Forest', { color: '#ffffff', fontSize: '36px' }).setOrigin(0.5);
    this.add.text(centerX, 160, 'N/ENTER: New Game  |  L: Load Slot 1  |  Q: Quit', {
      color: '#dddddd',
      fontSize: '16px'
    }).setOrigin(0.5);

    this.add.text(centerX, 186, 'Click anywhere to focus input', {
      color: '#b0b0b0',
      fontSize: '14px'
    }).setOrigin(0.5);

    const saves = listSaves();
    const saveText = saves.length === 0 ? 'No saves found.' : saves.map((s) => `Slot ${s.slot}: Day ${s.day} (${s.status})`).join('\n');
    this.add.text(centerX, 240, saveText, { color: '#a9d7ff', align: 'center' }).setOrigin(0.5, 0);

    this.createMenuButton(centerX, 330, 'New Game', () => this.startNewGame());
    this.createMenuButton(centerX, 390, 'Load Slot 1', () => this.loadSlot1());
    this.createMenuButton(centerX, 450, 'Quit', () => this.quitGame());

    this.input.keyboard!.enabled = true;
    const onFocus = () => {
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
        this.input.keyboard.resetKeys();
      }
    };
    const onBlur = () => {
      if (this.input.keyboard) {
        this.input.keyboard.enabled = false;
      }
    };
    this.game.events.on(Phaser.Core.Events.FOCUS, onFocus);
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.FOCUS, onFocus);
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
    });

    this.input.once('pointerdown', () => {
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
        this.input.keyboard.resetKeys();
      }
    });

    this.input.keyboard?.on('keydown-N', () => this.startNewGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startNewGame());
    this.input.keyboard?.on('keydown-L', () => this.loadSlot1());
    this.input.keyboard?.on('keydown-Q', () => this.quitGame());
  }
}
