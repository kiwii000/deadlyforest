import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { GameOverScene } from '../scenes/GameOverScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { PlayScene } from '../scenes/PlayScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#101015',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MainMenuScene, PlayScene, GameOverScene],
  pixelArt: true
};
