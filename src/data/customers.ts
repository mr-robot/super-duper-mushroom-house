import { Customer } from '../types';

export const CUSTOMER_TEMPLATES: Omit<Customer, 'id'>[] = [
  { name: 'Fern the Forager', portrait: '🧝', requestedItemId: 'healing_potion', reward: 35, patience: 3 },
  { name: 'Mycel Mage', portrait: '🧙', requestedItemId: 'mana_elixir', reward: 40, patience: 2 },
  { name: 'Garden Gnome', portrait: '🧑‍🌾', requestedItemId: 'growth_serum', reward: 38, patience: 3 },
  { name: 'Lunar Lady', portrait: '🧚', requestedItemId: 'moon_brew', reward: 55, patience: 2 },
];

let customerCounter = 0;

export function generateCustomer(): Customer {
  const template = CUSTOMER_TEMPLATES[Math.floor(Math.random() * CUSTOMER_TEMPLATES.length)];
  return { ...template, id: `customer_${customerCounter++}` };
}
