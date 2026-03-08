import Phaser from 'phaser';

export const eventBus = new Phaser.Events.EventEmitter();

export type GameEvent =
  | 'ItemCollected'
  | 'DamageTaken'
  | 'CraftCompleted'
  | 'NightStarted'
  | 'DayStarted'
  | 'PlayerDied';
