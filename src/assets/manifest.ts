export type AssetId =
  | 'player_idle'
  | 'player_run'
  | 'enemy_idle'
  | 'resource_tree'
  | 'resource_rock'
  | 'resource_bush'
  | 'resource_grass'
  | 'resource_sapling'
  | 'structure_campfire'
  | 'structure_science';

export interface VisualDef {
  color: number;
  width: number;
  height: number;
  originY?: number;
}

export const visualManifest: Record<AssetId, VisualDef> = {
  player_idle: { color: 0x4ea1ff, width: 20, height: 26, originY: 0.7 },
  player_run: { color: 0x3f89dd, width: 20, height: 26, originY: 0.7 },
  enemy_idle: { color: 0xaa3344, width: 18, height: 18, originY: 0.65 },
  resource_tree: { color: 0x226622, width: 26, height: 34 },
  resource_rock: { color: 0x666666, width: 24, height: 20 },
  resource_bush: { color: 0x2d8d2d, width: 20, height: 16 },
  resource_grass: { color: 0x77bb55, width: 12, height: 14 },
  resource_sapling: { color: 0x66aa44, width: 10, height: 18 },
  structure_campfire: { color: 0xff9933, width: 22, height: 16 },
  structure_science: { color: 0xbbb277, width: 26, height: 26 }
};
