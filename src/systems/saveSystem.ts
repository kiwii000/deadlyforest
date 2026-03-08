import type { SaveData } from '../core/types';

const PREFIX = 'deadlyforest_slot_';

export function saveSlot(slot: number, data: SaveData): void {
  localStorage.setItem(`${PREFIX}${slot}`, JSON.stringify(data));
}

export function loadSlot(slot: number): SaveData | null {
  const raw = localStorage.getItem(`${PREFIX}${slot}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function listSaves(): SaveData['meta'][] {
  const result: SaveData['meta'][] = [];
  for (let i = 1; i <= 3; i += 1) {
    const data = loadSlot(i);
    if (data) result.push(data.meta);
  }
  return result;
}
