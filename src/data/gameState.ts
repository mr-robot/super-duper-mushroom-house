import { GameState, InventorySlot, Customer } from '../types';
import { INGREDIENTS } from './ingredients';
import { EQUIPMENT } from './equipment';
import { generateCustomer } from './customers';

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
  };
}

let state: GameState = createInitialState();

export function getGameState(): GameState {
  return state;
}

export function setGameState(newState: GameState): void {
  state = newState;
}

export function addIngredient(ingredientId: string, qty: number = 1): void {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  if (slot) {
    slot.quantity += qty;
  } else {
    state.inventory.push({ ingredientId, quantity: qty });
  }
}

export function removeIngredient(ingredientId: string, qty: number = 1): boolean {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  if (!slot || slot.quantity < qty) return false;
  slot.quantity -= qty;
  if (slot.quantity <= 0) {
    state.inventory = state.inventory.filter(s => s.ingredientId !== ingredientId);
  }
  return true;
}

export function getIngredientQuantity(ingredientId: string): number {
  const slot = state.inventory.find(s => s.ingredientId === ingredientId);
  return slot ? slot.quantity : 0;
}

export function addMoney(amount: number): void {
  state.money += amount;
}

export function removeMoney(amount: number): boolean {
  if (state.money < amount) return false;
  state.money -= amount;
  return true;
}

export function addCustomer(): void {
  if (state.activeCustomers.length < 4) {
    state.activeCustomers.push(generateCustomer());
  }
}

export function removeCustomer(customerId: string): void {
  state.activeCustomers = state.activeCustomers.filter(c => c.id !== customerId);
}
