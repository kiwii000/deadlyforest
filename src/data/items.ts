import type { ItemDef, ItemId } from '../core/types';

export const items: Record<ItemId, ItemDef> = {
  grass: { id: 'grass', name: 'Cut Grass', maxStack: 40, tags: ['resource', 'fuel'], fuel: 4 },
  twig: { id: 'twig', name: 'Twigs', maxStack: 40, tags: ['resource', 'fuel'], fuel: 4 },
  flint: { id: 'flint', name: 'Flint', maxStack: 40, tags: ['resource'] },
  berry: {
    id: 'berry',
    name: 'Berries',
    maxStack: 20,
    tags: ['food'],
    edible: { hunger: 8, health: 0, sanity: 1 }
  },
  log: { id: 'log', name: 'Log', maxStack: 20, tags: ['resource', 'fuel'], fuel: 8 },
  stone: { id: 'stone', name: 'Stone', maxStack: 20, tags: ['resource'] },
  axe: { id: 'axe', name: 'Axe', maxStack: 1, tags: ['tool'], tool: { kind: 'axe', power: 2 } },
  pickaxe: { id: 'pickaxe', name: 'Pickaxe', maxStack: 1, tags: ['tool'], tool: { kind: 'pickaxe', power: 2 } },
  torch: {
    id: 'torch',
    name: 'Torch',
    maxStack: 1,
    tags: ['tool', 'fuel'],
    tool: { kind: 'weapon', power: 1 },
    fuel: 45
  },
  campfire: { id: 'campfire', name: 'Campfire Kit', maxStack: 5, tags: ['structure'], placeable: 'campfire' },
  science_machine: {
    id: 'science_machine',
    name: 'Science Machine',
    maxStack: 1,
    tags: ['structure'],
    placeable: 'science_machine'
  },
  cooked_berry: {
    id: 'cooked_berry',
    name: 'Cooked Berries',
    maxStack: 20,
    tags: ['food'],
    edible: { hunger: 12, health: 2, sanity: 2 }
  },
  monster_meat: {
    id: 'monster_meat',
    name: 'Monster Meat',
    maxStack: 20,
    tags: ['food'],
    edible: { hunger: 10, health: -8, sanity: -8 }
  }
};
