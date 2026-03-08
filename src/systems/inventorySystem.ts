import type { InventorySlot, ItemId } from '../core/types';
import { items } from '../data/items';

export class InventorySystem {
  slots: Array<InventorySlot | null>;
  constructor(size = 16) {
    this.slots = Array.from({ length: size }, () => null);
  }

  add(itemId: ItemId, qty: number): number {
    let left = qty;
    const maxStack = items[itemId].maxStack;
    for (const slot of this.slots) {
      if (!slot || slot.itemId !== itemId || slot.qty >= maxStack) continue;
      const space = maxStack - slot.qty;
      const add = Math.min(space, left);
      slot.qty += add;
      left -= add;
      if (left <= 0) return 0;
    }
    for (let i = 0; i < this.slots.length && left > 0; i += 1) {
      if (this.slots[i]) continue;
      const add = Math.min(maxStack, left);
      this.slots[i] = { itemId, qty: add };
      left -= add;
    }
    return left;
  }

  count(itemId: ItemId): number {
    return this.slots.reduce((acc, s) => acc + (s?.itemId === itemId ? s.qty : 0), 0);
  }

  remove(itemId: ItemId, qty: number): boolean {
    if (this.count(itemId) < qty) return false;
    let need = qty;
    for (let i = 0; i < this.slots.length && need > 0; i += 1) {
      const s = this.slots[i];
      if (!s || s.itemId !== itemId) continue;
      const take = Math.min(s.qty, need);
      s.qty -= take;
      need -= take;
      if (s.qty <= 0) this.slots[i] = null;
    }
    return true;
  }

  swap(a: number, b: number): void {
    [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]];
  }

  split(index: number): boolean {
    const slot = this.slots[index];
    if (!slot || slot.qty < 2) return false;
    const empty = this.slots.findIndex((s) => s === null);
    if (empty < 0) return false;
    const half = Math.floor(slot.qty / 2);
    slot.qty -= half;
    this.slots[empty] = { itemId: slot.itemId, qty: half };
    return true;
  }
}
