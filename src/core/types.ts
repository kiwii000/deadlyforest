export type GameState = 'MainMenu' | 'Playing' | 'Paused' | 'GameOver';
export type TimePhase = 'day' | 'dusk' | 'night';

export type ItemId =
  | 'grass'
  | 'twig'
  | 'flint'
  | 'berry'
  | 'log'
  | 'stone'
  | 'axe'
  | 'pickaxe'
  | 'torch'
  | 'campfire'
  | 'science_machine'
  | 'cooked_berry'
  | 'monster_meat';

export type ItemTag = 'resource' | 'tool' | 'food' | 'fuel' | 'structure' | 'weapon';

export interface ItemDef {
  id: ItemId;
  name: string;
  maxStack: number;
  tags: ItemTag[];
  edible?: { hunger: number; health: number; sanity: number };
  tool?: { kind: 'axe' | 'pickaxe' | 'weapon'; power: number };
  fuel?: number;
  placeable?: 'campfire' | 'science_machine';
}

export interface Recipe {
  id: string;
  output: { itemId: ItemId; qty: number };
  ingredients: Array<{ itemId: ItemId; qty: number }>;
  station?: 'science_machine';
  unlock?: 'starter' | 'science';
}

export interface InventorySlot {
  itemId: ItemId;
  qty: number;
}

export type NodeType = 'tree' | 'boulder' | 'berry_bush' | 'grass_tuft' | 'sapling';

export interface ResourceNodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  regrowAt?: number;
}

export interface EnemyData {
  id: string;
  x: number;
  y: number;
  hp: number;
  state: 'idle' | 'chase' | 'attack' | 'leash';
}

export interface SaveData {
  version: number;
  meta: { slot: number; playtime: number; day: number; status: string; savedAt: string };
  seed: string;
  player: {
    x: number;
    y: number;
    stats: { health: number; hunger: number; sanity: number };
    inventory: Array<InventorySlot | null>;
    hand: InventorySlot | null;
    body: InventorySlot | null;
  };
  world: {
    timeSeconds: number;
    nodes: ResourceNodeData[];
    structures: Array<{ id: string; type: 'campfire' | 'science_machine'; x: number; y: number; fuel?: number }>;
    enemies: EnemyData[];
  };
}
