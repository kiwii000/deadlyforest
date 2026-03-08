import { describe, expect, it } from 'vitest';
import { StatsSystem } from '../src/systems/statsSystem';
import { InventorySystem } from '../src/systems/inventorySystem';
import { CraftingSystem } from '../src/systems/craftingSystem';
import { generateWorld } from '../src/systems/worldGen';
import { saveSlot, loadSlot } from '../src/systems/saveSystem';

describe('stats', () => {
  it('clamps values', () => {
    const s = new StatsSystem();
    s.eat(999, 999, 999);
    expect(s.health).toBe(100);
    expect(s.hunger).toBe(100);
    expect(s.sanity).toBe(100);
  });
});

describe('crafting', () => {
  it('craft validates inventory', () => {
    const inv = new InventorySystem();
    const craft = new CraftingSystem();
    inv.add('twig', 3);
    inv.add('flint', 3);
    expect(craft.craft('axe', inv, false)).toBe(true);
    expect(inv.count('axe')).toBe(1);
  });
});

describe('worldgen', () => {
  it('is deterministic from seed', () => {
    const a = generateWorld('seed1');
    const b = generateWorld('seed1');
    expect(a.nodes.slice(0, 20)).toEqual(b.nodes.slice(0, 20));
  });
});

describe('save-load', () => {
  it('round-trips save data', () => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        clear: () => {
          store = {};
        }
      };
    })();
    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true });
    saveSlot(1, {
      version: 1,
      meta: { slot: 1, playtime: 1, day: 1, status: 'ok', savedAt: 'now' },
      seed: 'x',
      player: { x: 1, y: 2, stats: { health: 3, hunger: 4, sanity: 5 }, inventory: [], hand: null, body: null },
      world: { timeSeconds: 2, nodes: [], structures: [], enemies: [] }
    });
    expect(loadSlot(1)?.seed).toBe('x');
  });
});
