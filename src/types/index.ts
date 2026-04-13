export interface Ingredient {
  id: string;
  name: string;
  description: string;
  color: number;
  basePrice: number;
  isCrafted: boolean;
  icon: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredientA: string;
  ingredientB: string;
  equipment: string;
  result: string;
  craftTime: number;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  color: number;
  price: number;
  icon: string;
}

export interface Customer {
  id: string;
  name: string;
  portrait: string;
  requestedItemId: string;
  reward: number;
  patience: number;
}

export interface InventorySlot {
  ingredientId: string;
  quantity: number;
}

export interface GameState {
  money: number;
  inventory: InventorySlot[];
  ownedEquipment: string[];
  activeCustomers: Customer[];
}
