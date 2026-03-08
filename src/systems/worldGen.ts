import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from '../config/constants';
import type { NodeType, ResourceNodeData } from '../core/types';
import { SeededRng } from '../utils/rng';

const nodeHp: Record<NodeType, number> = {
  tree: 8,
  boulder: 8,
  berry_bush: 4,
  grass_tuft: 2,
  sapling: 2
};

export interface WorldData {
  biome: ('meadow' | 'forest')[];
  nodes: ResourceNodeData[];
}

export function generateWorld(seed: string): WorldData {
  const rng = new SeededRng(seed);
  const biome: ('meadow' | 'forest')[] = [];
  const nodes: ResourceNodeData[] = [];
  const cx = WORLD_WIDTH * TILE_SIZE * 0.5;
  const cy = WORLD_HEIGHT * TILE_SIZE * 0.5;
  let idCounter = 1;

  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      const idx = y * WORLD_WIDTH + x;
      const forestScore = rng.next() + (y / WORLD_HEIGHT) * 0.25;
      const b = forestScore > 0.6 ? 'forest' : 'meadow';
      biome[idx] = b;
      const wx = x * TILE_SIZE + TILE_SIZE / 2;
      const wy = y * TILE_SIZE + TILE_SIZE / 2;
      const dist = Math.hypot(wx - cx, wy - cy);
      if (dist < 120) continue;
      const spawn = (type: NodeType, chance: number): void => {
        if (rng.next() > chance) return;
        const hp = nodeHp[type];
        nodes.push({ id: `n_${idCounter++}`, type, x: wx, y: wy, hp, maxHp: hp });
      };
      if (b === 'forest') {
        spawn('tree', 0.22);
        spawn('sapling', 0.12);
        spawn('berry_bush', 0.08);
      } else {
        spawn('grass_tuft', 0.16);
        spawn('boulder', 0.08);
        spawn('berry_bush', 0.05);
      }
      if (rng.next() < 0.04) spawn('boulder', 1);
      if (rng.next() < 0.05) spawn('grass_tuft', 1);
      if (rng.next() < 0.05) spawn('sapling', 1);
    }
  }

  const guaranteed: NodeType[] = ['grass_tuft', 'sapling', 'boulder', 'berry_bush', 'tree'];
  guaranteed.forEach((type, i) => {
    const hp = nodeHp[type];
    nodes.push({ id: `starter_${type}`, type, x: cx + 80 + i * 18, y: cy + 30, hp, maxHp: hp });
  });
  return { biome, nodes };
}
