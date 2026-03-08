import type { Recipe } from '../core/types';

export const recipes: Recipe[] = [
  { id: 'axe', output: { itemId: 'axe', qty: 1 }, ingredients: [{ itemId: 'twig', qty: 1 }, { itemId: 'flint', qty: 1 }], unlock: 'starter' },
  { id: 'pickaxe', output: { itemId: 'pickaxe', qty: 1 }, ingredients: [{ itemId: 'twig', qty: 1 }, { itemId: 'flint', qty: 2 }], unlock: 'starter' },
  { id: 'torch', output: { itemId: 'torch', qty: 1 }, ingredients: [{ itemId: 'grass', qty: 2 }, { itemId: 'twig', qty: 2 }], unlock: 'starter' },
  { id: 'campfire', output: { itemId: 'campfire', qty: 1 }, ingredients: [{ itemId: 'log', qty: 2 }, { itemId: 'stone', qty: 2 }], unlock: 'starter' },
  { id: 'science_machine', output: { itemId: 'science_machine', qty: 1 }, ingredients: [{ itemId: 'log', qty: 2 }, { itemId: 'stone', qty: 4 }, { itemId: 'twig', qty: 2 }], unlock: 'starter' },
  { id: 'cooked_berry', output: { itemId: 'cooked_berry', qty: 1 }, ingredients: [{ itemId: 'berry', qty: 1 }], station: 'science_machine', unlock: 'science' }
];
