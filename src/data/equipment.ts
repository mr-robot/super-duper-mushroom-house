import { Equipment } from '../types';

export const EQUIPMENT: Equipment[] = [
  { id: 'cauldron', name: 'Cauldron', description: 'A sturdy mushroom cauldron for brewing potions', color: 0x4a3728, price: 0, icon: '🫕' },
];

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT.find(e => e.id === id);
}
