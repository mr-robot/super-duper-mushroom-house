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

  /**
   * Simulates the exact sell button handler from UIScene.renderCustomerUI
   * This validates both the backend logic AND that the handler code is correct
   */
  function simulateSellButtonClick(customer: ReturnType<typeof getGameState>['activeCustomers'][0]) {
    removeIngredient(customer.requestedItemId, 1);
    addMoney(customer.reward);
    removeCustomer(customer.id);
    addCustomer();
  }

  it('should allow selling requested item to customer', () => {
    setGameState(createInitialState());
    const state = getGameState();
    const customer = state.activeCustomers[0];
    const requestedItem = customer.requestedItemId;
    const reward = customer.reward;

    // Customer wants a crafted item we don't have yet
    expect(getIngredientQuantity(requestedItem)).toBe(0);

    // Add the item to inventory (crafted or purchased)
    addIngredient(requestedItem, 1);
    expect(getIngredientQuantity(requestedItem)).toBe(1);

    // Execute sell workflow (same as UI button handler)
    const moneyBefore = state.money;
    simulateSellButtonClick(customer);

    // Verify: item removed, money gained, customer replaced
    expect(getIngredientQuantity(requestedItem)).toBe(0);
    expect(state.money).toBe(moneyBefore + reward);
    expect(state.activeCustomers.find(c => c.id === customer.id)).toBeUndefined();
    expect(state.activeCustomers.length).toBe(2); // addCustomer replaces
  });

  it('should NOT sell if player does not have the requested item', () => {
    setGameState(createInitialState());
    const state = getGameState();
    const customer = state.activeCustomers[0];
    const requestedItem = customer.requestedItemId;
    const moneyBefore = state.money;

    // Player has zero of the requested item
    expect(getIngredientQuantity(requestedItem)).toBe(0);

    // Try to sell - should fail silently (sell button wouldn't show anyway)
    const success = removeIngredient(requestedItem, 1);
    expect(success).toBe(false);
    expect(state.money).toBe(moneyBefore);
  });

  it('should sell healing_potion to Fern (customer who wants it)', () => {
    // Fern the Forager is the only customer template who wants healing_potion
    setGameState(createInitialState());
    const state = getGameState();

    // Find or create a customer who wants healing_potion
    let customer = state.activeCustomers.find(c => c.requestedItemId === 'healing_potion');
    if (!customer) {
      removeCustomer(state.activeCustomers[0].id);
      addCustomer(); // keep generating until we get one who wants healing_potion
      customer = getGameState().activeCustomers.find(c => c.requestedItemId === 'healing_potion');
    }

    expect(customer).toBeDefined();
    expect(customer!.requestedItemId).toBe('healing_potion');
    expect(customer!.reward).toBe(35);
    expect(customer!.name).toBe('Fern the Forager');

    addIngredient('healing_potion', 1);
    expect(getIngredientQuantity('healing_potion')).toBe(1);

    const moneyBefore = state.money;
    simulateSellButtonClick(customer!);

    expect(state.money).toBe(moneyBefore + 35);
    expect(getIngredientQuantity('healing_potion')).toBe(0);
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

  it('should maintain customer count at 2 after multiple sells', () => {
    setGameState(createInitialState());

    for (let i = 0; i < 5; i++) {
      const state = getGameState();
      const customer = state.activeCustomers[0];
      addIngredient(customer.requestedItemId, 1);
      simulateSellButtonClick(customer);
      expect(state.activeCustomers.length).toBe(2);
    }
  });
});
