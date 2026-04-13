import { Recipe } from '../types';

export const RECIPES: Recipe[] = [
  { id: 'recipe_healing', name: 'Healing Potion', ingredientA: 'red_cap', ingredientB: 'root_extract', equipment: 'cauldron', result: 'healing_potion', craftTime: 2000 },
  { id: 'recipe_mana', name: 'Mana Elixir', ingredientA: 'blue_cap', ingredientB: 'fairy_dust', equipment: 'cauldron', result: 'mana_elixir', craftTime: 2000 },
  { id: 'recipe_growth', name: 'Growth Serum', ingredientA: 'green_cap', ingredientB: 'root_extract', equipment: 'cauldron', result: 'growth_serum', craftTime: 2500 },
  { id: 'recipe_moon_brew', name: 'Moon Brew', ingredientA: 'moon_petals', ingredientB: 'fairy_dust', equipment: 'cauldron', result: 'moon_brew', craftTime: 3000 },
];

export function findRecipe(ingredientA: string, ingredientB: string, equipmentId: string): Recipe | undefined {
  return RECIPES.find(r =>
    r.equipment === equipmentId &&
    ((r.ingredientA === ingredientA && r.ingredientB === ingredientB) ||
     (r.ingredientA === ingredientB && r.ingredientB === ingredientA))
  );
}
