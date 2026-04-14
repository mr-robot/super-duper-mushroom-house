import { GameState, InventorySlot, Customer } from '../types';
import { INGREDIENTS } from './ingredients';
import { EQUIPMENT } from './equipment';
import { generateCustomer } from './customers';
import { resetGameTime } from './gameTime';

const STORAGE_KEY = 'potion-mixer-game-state';

export function createInitialState(): GameState {
  const startingInventory: InventorySlot[] = INGREDIENTS.filter(i => !i.isCrafted).map(i => ({
    ingredientId: i.id,
    quantity: 3,
  }));

  const startingCustomers: Customer[] = [
    generateCustomer(),
    generateCustomer(),
  ];

  return {
    money: 50,
    inventory: startingInventory,
    ownedEquipment: [EQUIPMENT[0].id],
    activeCustomers: startingCustomers,
    discoveredRecipes: [],
  };
}

function loadState(): GameState {
  try {
    if (typeof localStorage === 'undefined' || localStorage === null) {
      return createInitialState();
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (e) {
    console.warn('Failed to load game state from localStorage:', e);
  }
  return createInitialState();
}

function saveState(state: GameState): void {
  try {
    if (typeof localStorage === 'undefined' || localStorage === null) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game state to localStorage:', e);
  }
}

let state: GameState = loadState();

export function getGameState(): GameState {
  return state;
}

export function setGameState(newState: GameState): void {
  state = newState;
  saveState(state);
}

export function addIngredient(ingredientId: string, qty: number = 1): void {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  if (slot) {
    slot.quantity += qty;
  } else {
    state.inventory.push({ ingredientId, quantity: qty });
  }
  saveState(state);
}

export function removeIngredient(ingredientId: string, qty: number = 1): boolean {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  if (!slot || slot.quantity < qty) return false;
  slot.quantity -= qty;
  if (slot.quantity <= 0) {
    state.inventory = state.inventory.filter(s => s.ingredientId !== ingredientId);
  }
  saveState(state);
  return true;
}

export function getIngredientQuantity(ingredientId: string): number {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  return slot ? slot.quantity : 0;
}

export function addMoney(amount: number): void {
  state.money += amount;
  saveState(state);
}

export function removeMoney(amount: number): boolean {
  if (state.money < amount) return false;
  state.money -= amount;
  saveState(state);
  return true;
}

export function addCustomer(): void {
  if (state.activeCustomers.length < 4) {
    state.activeCustomers.push(generateCustomer());
    saveState(state);
  }
}

export function removeCustomer(customerId: string): void {
  state.activeCustomers = state.activeCustomers.filter(c => c.id !== customerId);
  saveState(state);
}

export function discoverRecipe(recipeId: string): void {
  if (!state.discoveredRecipes.includes(recipeId)) {
    state.discoveredRecipes.push(recipeId);
    saveState(state);
  }
}

export function isRecipeDiscovered(recipeId: string): boolean {
  return state.discoveredRecipes.includes(recipeId);
}

export function getDiscoveredRecipes(): string[] {
  return [...state.discoveredRecipes];
}

export function resetGameState(): void {
  if (typeof localStorage !== 'undefined' && localStorage !== null) {
    localStorage.removeItem(STORAGE_KEY);
  }
  state = createInitialState();
  resetGameTime();
}
