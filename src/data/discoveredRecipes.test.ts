import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, getGameState, setGameState, discoverRecipe, isRecipeDiscovered, getDiscoveredRecipes } from './gameState';
import { findRecipe } from './recipes';

describe('Discovered Recipes', () => {
  beforeEach(() => {
    setGameState(createInitialState());
  });

  it('should start with no discovered recipes', () => {
    const state = getGameState();
    expect(state.discoveredRecipes).toEqual([]);
  });

  it('should discover a recipe when craft succeeds', () => {
    const state = getGameState();
    expect(state.discoveredRecipes.length).toBe(0);

    discoverRecipe('recipe_healing');

    expect(state.discoveredRecipes).toContain('recipe_healing');
  });

  it('should not duplicate discovered recipes', () => {
    const state = getGameState();
    discoverRecipe('recipe_healing');
    discoverRecipe('recipe_healing');
    expect(state.discoveredRecipes.filter(r => r === 'recipe_healing').length).toBe(1);
  });

  it('should check if recipe is discovered', () => {
    expect(isRecipeDiscovered('recipe_healing')).toBe(false);
    discoverRecipe('recipe_healing');
    expect(isRecipeDiscovered('recipe_healing')).toBe(true);
  });

  it('should get all discovered recipes', () => {
    discoverRecipe('recipe_healing');
    discoverRecipe('recipe_mana');
    const discovered = getDiscoveredRecipes();
    expect(discovered).toContain('recipe_healing');
    expect(discovered).toContain('recipe_mana');
    expect(discovered.length).toBe(2);
  });

  it('should discover recipe when crafting', () => {
    expect(isRecipeDiscovered('recipe_healing')).toBe(false);

    const recipe = findRecipe('red_cap', 'root_extract', 'cauldron');
    expect(recipe).toBeDefined();

    if (recipe) {
      discoverRecipe(recipe.id);
      expect(isRecipeDiscovered('recipe_healing')).toBe(true);
    }
  });

  it('should track multiple discoveries', () => {
    discoverRecipe('recipe_healing');
    discoverRecipe('recipe_mana');
    discoverRecipe('recipe_growth');
    discoverRecipe('recipe_moon_brew');

    const discovered = getDiscoveredRecipes();
    expect(discovered.length).toBe(4);
    expect(discovered).toContain('recipe_healing');
    expect(discovered).toContain('recipe_mana');
    expect(discovered).toContain('recipe_growth');
    expect(discovered).toContain('recipe_moon_brew');
  });
});