import { describe, it, expect } from 'vitest';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { findRecipe } from '../data/recipes';
import { EQUIPMENT } from '../data/equipment';
import { createInitialState } from '../data/gameState';

describe('Ingredients', () => {
  it('should have 10 ingredients', () => {
    expect(INGREDIENTS.length).toBe(10);
  });

  it('should find ingredient by id', () => {
    const ing = getIngredientById('red_cap');
    expect(ing).toBeDefined();
    expect(ing!.name).toBe('Red Cap');
  });

  it('should return undefined for unknown id', () => {
    expect(getIngredientById('nonexistent')).toBeUndefined();
  });
});

describe('Recipes', () => {
  it('should find a recipe by ingredients and equipment', () => {
    const recipe = findRecipe('red_cap', 'root_extract', 'cauldron');
    expect(recipe).toBeDefined();
    expect(recipe!.result).toBe('healing_potion');
  });

  it('should find recipe regardless of ingredient order', () => {
    const recipe = findRecipe('root_extract', 'red_cap', 'cauldron');
    expect(recipe).toBeDefined();
    expect(recipe!.result).toBe('healing_potion');
  });

  it('should return undefined for invalid combination', () => {
    expect(findRecipe('red_cap', 'fairy_dust', 'cauldron')).toBeUndefined();
  });
});

describe('Equipment', () => {
  it('should have at least 1 piece of equipment', () => {
    expect(EQUIPMENT.length).toBeGreaterThanOrEqual(1);
  });

  it('should have a cauldron', () => {
    const cauldron = EQUIPMENT.find(e => e.id === 'cauldron');
    expect(cauldron).toBeDefined();
  });
});

describe('GameState', () => {
  it('should create initial state with money', () => {
    const state = createInitialState();
    expect(state.money).toBe(50);
  });

  it('should start with base ingredients in inventory', () => {
    const state = createInitialState();
    const baseIngredients = INGREDIENTS.filter(i => !i.isCrafted);
    expect(state.inventory.length).toBe(baseIngredients.length);
  });

  it('should own the cauldron', () => {
    const state = createInitialState();
    expect(state.ownedEquipment).toContain('cauldron');
  });

  it('should start with active customers', () => {
    const state = createInitialState();
    expect(state.activeCustomers.length).toBeGreaterThan(0);
  });
});
