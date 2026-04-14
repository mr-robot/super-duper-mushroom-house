# Active Context: Mushroom Craft (Potion Mixer Game)

## Current State

**Project**: Mushroom Craft - A Phaser 3 potion-crafting game with customer management

## Recently Completed

- [x] localStorage persistence for game state (auto-save on state changes)
- [x] `resetGameState()` function to clear saved state
- [x] Settings button in HUD (top-right gear icon)
- [x] Settings menu UI with reset button
- [x] localStorage persistence tests with mocked localStorage
- [x] Graceful handling when localStorage is undefined (SSR safety)

## Current Structure

| File | Purpose | Status |
|------|---------|--------|
| `src/data/gameState.ts` | Game state management with localStorage | ✅ |
| `src/scenes/HUDScene.ts` | HUD with money, timer, tabs, settings button | ✅ |
| `src/scenes/UIScene.ts` | UI panels (craft, inventory, shop, customers, recipes, settings) | ✅ |

## Key Functions (gameState.ts)

- `loadState()` / `saveState()` - localStorage operations with error handling
- `getGameState()` / `setGameState()` - state access
- `addIngredient()`, `removeIngredient()`, `addMoney()`, `removeMoney()` - inventory/money management
- `addCustomer()`, `removeCustomer()`, `discoverRecipe()` - game mechanics
- `resetGameState()` - clears localStorage and resets to initial state

## Settings Menu

- Opens via ⚙️ button in HUD
- Contains "Reset Game" button that calls `resetGameState()` and closes panel

## Session History

| Date | Changes |
|------|---------|
| Initial | Base Phaser game with crafting and customers |
| Today | localStorage persistence, settings menu with reset |

## Pending Improvements

- [ ] Add visual feedback when game saves
- [ ] Consider debouncing saves for frequent changes
