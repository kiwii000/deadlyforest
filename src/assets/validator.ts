import { visualManifest, type AssetId } from './manifest';

const requiredAssetIds: AssetId[] = [
  'player_idle',
  'player_run',
  'enemy_idle',
  'resource_tree',
  'resource_rock',
  'resource_bush',
  'resource_grass',
  'resource_sapling',
  'structure_campfire',
  'structure_science'
];

export function validateAssets(): string[] {
  const errors: string[] = [];
  requiredAssetIds.forEach((id) => {
    const v = visualManifest[id];
    if (!v) errors.push(`Missing asset ID ${id}`);
    else if (v.width <= 0 || v.height <= 0) errors.push(`Invalid dimensions for ${id}`);
  });
  return errors;
}
