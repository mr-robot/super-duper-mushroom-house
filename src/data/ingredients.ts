import { Ingredient } from '../types';

export const INGREDIENTS: Ingredient[] = [
  { id: 'red_cap', name: 'Red Cap', description: 'A common red mushroom cap', color: 0xcc3333, basePrice: 5, isCrafted: false, icon: '🍄' },
  { id: 'blue_cap', name: 'Blue Cap', description: 'A cool blue mushroom cap', color: 0x3366cc, basePrice: 5, isCrafted: false, icon: '🍄' },
  { id: 'green_cap', name: 'Green Cap', description: 'A vibrant green mushroom cap', color: 0x33cc33, basePrice: 5, isCrafted: false, icon: '🍄' },
  { id: 'moon_petals', name: 'Moon Petals', description: 'Glowing petals from a moonflower', color: 0xccccff, basePrice: 8, isCrafted: false, icon: '🌸' },
  { id: 'root_extract', name: 'Root Extract', description: 'Thick syrupy root extract', color: 0x8b4513, basePrice: 6, isCrafted: false, icon: '🫗' },
  { id: 'fairy_dust', name: 'Fairy Dust', description: 'Sparkling magical dust', color: 0xffccff, basePrice: 10, isCrafted: false, icon: '✨' },
  { id: 'healing_potion', name: 'Healing Potion', description: 'Restores health and vitality', color: 0xff6666, basePrice: 25, isCrafted: true, icon: '🧪' },
  { id: 'mana_elixir', name: 'Mana Elixir', description: 'Restores magical energy', color: 0x6666ff, basePrice: 30, isCrafted: true, icon: '🧪' },
  { id: 'growth_serum', name: 'Growth Serum', description: 'Makes plants grow rapidly', color: 0x66ff66, basePrice: 28, isCrafted: true, icon: '🧪' },
  { id: 'moon_brew', name: 'Moon Brew', description: 'A shimmering potion of moonlight', color: 0xaaaaff, basePrice: 40, isCrafted: true, icon: '🌙' },
];

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id);
}
