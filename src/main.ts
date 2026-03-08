import { validateAssets } from './assets/validator';
import Phaser from 'phaser';
import { gameConfig } from './core/gameConfig';

const issues = validateAssets();
if (issues.length) console.warn('[AssetValidation]', issues.join('; '));
new Phaser.Game(gameConfig);
