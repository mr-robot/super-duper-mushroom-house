import { Customer } from '../types';
import { getGameTime } from './gameTime';

const CUSTOMER_DURATION_PER_PATIENCE = 30000;

export const CUSTOMER_TEMPLATES: Omit<Customer, 'id' | 'durationMs' | 'startTimeMs'>[] = [
  { name: 'Fern the Forager', portrait: '🧝', requestedItemId: 'healing_potion', reward: 35, patience: 3 },
  { name: 'Mycel Mage', portrait: '🧙', requestedItemId: 'mana_elixir', reward: 40, patience: 2 },
  { name: 'Garden Gnome', portrait: '🧑‍🌾', requestedItemId: 'growth_serum', reward: 38, patience: 3 },
  { name: 'Lunar Lady', portrait: '🧚', requestedItemId: 'moon_brew', reward: 55, patience: 2 },
];

let customerCounter = 0;

export function generateCustomer(): Customer {
  const template = CUSTOMER_TEMPLATES[Math.floor(Math.random() * CUSTOMER_TEMPLATES.length)];
  const gameTime = getGameTime();
  return {
    ...template,
    id: `customer_${customerCounter++}`,
    durationMs: template.patience * CUSTOMER_DURATION_PER_PATIENCE,
    startTimeMs: gameTime.elapsedMs,
  };
}

export function getCustomerRemainingTime(customer: Customer): number {
  const gameTime = getGameTime();
  const elapsed = gameTime.elapsedMs - customer.startTimeMs;
  return Math.max(0, customer.durationMs - elapsed);
}

export function isCustomerExpired(customer: Customer): boolean {
  return getCustomerRemainingTime(customer) <= 0;
}
