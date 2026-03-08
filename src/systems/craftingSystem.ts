import type { InventorySystem } from './inventorySystem';
import { recipes } from '../data/recipes';
import { eventBus } from '../core/eventBus';

export class CraftingSystem {
  scienceUnlocked = false;

  available(nearScience: boolean) {
    return recipes.filter((r) => {
      if (r.unlock === 'science' && !this.scienceUnlocked) return false;
      if (r.station === 'science_machine' && !nearScience) return false;
      return true;
    });
  }

  canCraft(recipeId: string, inventory: InventorySystem, nearScience: boolean): boolean {
    const recipe = this.available(nearScience).find((r) => r.id === recipeId);
    if (!recipe) return false;
    return recipe.ingredients.every((i) => inventory.count(i.itemId) >= i.qty);
  }

  craft(recipeId: string, inventory: InventorySystem, nearScience: boolean): boolean {
    const recipe = this.available(nearScience).find((r) => r.id === recipeId);
    if (!recipe || !this.canCraft(recipeId, inventory, nearScience)) return false;
    recipe.ingredients.forEach((i) => inventory.remove(i.itemId, i.qty));
    const left = inventory.add(recipe.output.itemId, recipe.output.qty);
    if (left > 0) return false;
    if (recipe.output.itemId === 'science_machine') this.scienceUnlocked = true;
    eventBus.emit('CraftCompleted', recipe.output.itemId);
    return true;
  }
}
