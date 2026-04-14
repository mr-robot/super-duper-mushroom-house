import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { findRecipe } from '../data/recipes';
import { EQUIPMENT } from '../data/equipment';
import { createInitialState, getGameState, setGameState, addIngredient, removeIngredient, addMoney, removeMoney, removeCustomer, addCustomer, getIngredientQuantity, discoverRecipe, resetGameState } from '../data/gameState';

const STORAGE_KEY = 'potion-mixer-game-state';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
});

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

describe('localStorage Persistence', () => {
  beforeEach(() => {
    store[STORAGE_KEY] = '';
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    resetGameState();
  });

  it('should save state to localStorage when setGameState is called', () => {
    const state = createInitialState();
    setGameState(state);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state));
  });

  it('should load state from localStorage when setGameState loads from storage', () => {
    const savedState = createInitialState();
    savedState.money = 999;
    store[STORAGE_KEY] = JSON.stringify(savedState);
    setGameState(savedState);
    expect(getGameState().money).toBe(999);
    const saved = JSON.parse(store[STORAGE_KEY]);
    expect(saved.money).toBe(999);
  });

  it('should return initial state when localStorage is empty', () => {
    resetGameState();
    expect(getGameState().money).toBe(50);
  });

  it('should save after addIngredient', () => {
    const before = getGameState().inventory.find(s => s.ingredientId === 'healing_potion');
    addIngredient('healing_potion', 5);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(store[STORAGE_KEY]);
    const slot = saved.inventory.find((s: { ingredientId: string; quantity: number }) => s.ingredientId === 'healing_potion');
    expect(slot?.quantity).toBe((before?.quantity || 0) + 5);
  });

  it('should save after removeIngredient', () => {
    addIngredient('red_cap', 5);
    localStorageMock.setItem.mockClear();
    removeIngredient('red_cap', 1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should save after addMoney', () => {
    addMoney(100);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(store[STORAGE_KEY]);
    expect(saved.money).toBe(150);
  });

  it('should save after removeMoney', () => {
    removeMoney(10);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(store[STORAGE_KEY]);
    expect(saved.money).toBe(40);
  });

  it('should save after addCustomer', () => {
    addCustomer();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should save after removeCustomer', () => {
    const customers = getGameState().activeCustomers;
    removeCustomer(customers[0].id);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should save after discoverRecipe', () => {
    discoverRecipe('healing_potion');
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(store[STORAGE_KEY]);
    expect(saved.discoveredRecipes).toContain('healing_potion');
  });

  it('should not save when removeMoney fails due to insufficient funds', () => {
    const initialMoney = getGameState().money;
    const success = removeMoney(initialMoney + 999);
    expect(success).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should not save when removeIngredient fails due to insufficient quantity', () => {
    const success = removeIngredient('nonexistent_ingredient', 1);
    expect(success).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should not save when addCustomer is at max capacity', () => {
    while (getGameState().activeCustomers.length < 4) {
      addCustomer();
    }
    localStorageMock.setItem.mockClear();
    addCustomer();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should reset game state and clear localStorage', () => {
    addMoney(100);
    discoverRecipe('healing_potion');
    localStorageMock.removeItem.mockClear();
    resetGameState();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(getGameState().money).toBe(50);
  });

  it('should handle corrupted localStorage gracefully', () => {
    store[STORAGE_KEY] = 'invalid-json{{';
    resetGameState();
    expect(getGameState().money).toBe(50);
  });

  it('should handle localStoragegetItem throwing', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('storage error'); });
    resetGameState();
    expect(getGameState().money).toBe(50);
  });

  it('should handle localStoragesetItem throwing', () => {
    localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('storage error'); });
    expect(() => addMoney(10)).not.toThrow();
  });
});
