import { describe, it, expect, beforeEach } from 'vitest';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { findRecipe } from '../data/recipes';
import { EQUIPMENT } from '../data/equipment';
import { createInitialState, getGameState, setGameState, addIngredient, removeIngredient, addMoney, removeCustomer, addCustomer, getIngredientQuantity } from '../data/gameState';

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
  beforeEach(() => {
    setGameState(createInitialState());
  });

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

describe('Selling to Customers', () => {
  beforeEach(() => {
    setGameState(createInitialState());
  });

  it('should allow selling crafted healing_potion to customer', () => {
    setGameState(createInitialState());
    const state = getGameState();
    const customer = state.activeCustomers[0];
    const requestedItem = customer.requestedItemId;
    const reward = customer.reward;
    expect(getIngredientQuantity(requestedItem)).toBe(0);
    addIngredient(requestedItem, 1);
    expect(getIngredientQuantity(requestedItem)).toBe(1);
    const moneyBefore = state.money;
    const success = removeIngredient(requestedItem, 1);
    expect(success).toBe(true);
    expect(getIngredientQuantity(requestedItem)).toBe(0);
    addMoney(reward);
    expect(state.money).toBe(moneyBefore + reward);
    removeCustomer(customer.id);
    expect(state.activeCustomers.find(c => c.id === customer.id)).toBeUndefined();
  });

  it('should not be able to sell item not in inventory', () => {
    const state = getGameState();
    const customer = state.activeCustomers[0];
    expect(getIngredientQuantity(customer.requestedItemId)).toBe(0);
    const success = removeIngredient(customer.requestedItemId, 1);
    expect(success).toBe(false);
  });

  it('should add new customer after removing one', () => {
    const state = getGameState();
    const initialCount = state.activeCustomers.length;
    const customerToRemove = state.activeCustomers[0];
    removeCustomer(customerToRemove.id);
    expect(state.activeCustomers.length).toBe(initialCount - 1);
    addCustomer();
    expect(state.activeCustomers.length).toBe(initialCount);
  });
});
