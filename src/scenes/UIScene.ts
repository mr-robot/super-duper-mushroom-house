import Phaser from 'phaser';
import { getGameState, addIngredient, removeIngredient, addMoney, removeCustomer, addCustomer, getIngredientQuantity } from '../data/gameState';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { findRecipe } from '../data/recipes';
import { getEquipmentById } from '../data/equipment';

type TabKey = 'craft' | 'inventory' | 'shop' | 'customers' | null;

export class UIScene extends Phaser.Scene {
  private currentTab: TabKey = null;
  private panelContainer!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabBg!: Phaser.GameObjects.Rectangle;
  private closeBtn!: Phaser.GameObjects.Container;

  private selectedIngredientA: string | null = null;
  private selectedIngredientB: string | null = null;
  private selectedEquipment: string | null = null;
  private isCrafting: boolean = false;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.panelContainer = this.add.container(0, 0).setVisible(false);

    this.tabBg = this.add.rectangle(400, 320, 760, 480, 0x1a0e2e, 0.95)
      .setStrokeStyle(2, 0x8866aa);
    this.panelContainer.add(this.tabBg);

    const closeBg = this.add.rectangle(0, 0, 28, 28, 0xcc3333);
    const closeTxt = this.add.text(0, 0, 'X', { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5);
    this.closeBtn = this.add.container(400 + 760 / 2 - 20, 320 - 480 / 2 + 20, [closeBg, closeTxt]);
    this.closeBtn.setSize(28, 28);
    this.closeBtn.setInteractive({ useHandCursor: true });
    this.closeBtn.on('pointerdown', () => this.closePanel());
    this.panelContainer.add(this.closeBtn);

    this.contentContainer = this.add.container(0, 0);
    this.panelContainer.add(this.contentContainer);

    this.events.on('open-tab', (key: TabKey) => {
      if (this.currentTab === key) {
        this.closePanel();
      } else {
        this.openTab(key);
      }
    });
  }

  private openTab(key: TabKey) {
    this.currentTab = key;
    this.panelContainer.setVisible(true);
    this.contentContainer.removeAll(true);
    this.selectedIngredientA = null;
    this.selectedIngredientB = null;
    this.selectedEquipment = null;

    switch (key) {
      case 'craft': this.renderCraftingUI(); break;
      case 'inventory': this.renderInventoryUI(); break;
      case 'shop': this.renderShopUI(); break;
      case 'customers': this.renderCustomerUI(); break;
    }
  }

  private closePanel() {
    this.currentTab = null;
    this.panelContainer.setVisible(false);
    this.contentContainer.removeAll(true);
  }

  private emitStateChanged() {
    this.events.emit('state-changed');
  }

  private renderCraftingUI() {
    const state = getGameState();
    const baseY = 100;

    const title = this.add.text(400, baseY, '🫕 Cauldron Crafting', {
      fontSize: '20px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const sectionY = baseY + 40;
    const sectionTitle = this.add.text(60, sectionY, 'Select Ingredients (top):', {
      fontSize: '14px', color: '#ccbbff', fontFamily: 'monospace',
    });
    this.contentContainer.add(sectionTitle);

    const availableIngredients = state.inventory.filter(s => s.quantity > 0);
    const cols = 5;
    const cellW = 140;
    const cellH = 50;
    const gridStartX = 60;
    const gridStartY = sectionY + 25;

    availableIngredients.forEach((slot, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gridStartX + col * cellW + cellW / 2;
      const y = gridStartY + row * (cellH + 4) + cellH / 2;
      const ing = getIngredientById(slot.ingredientId);
      if (!ing) return;

      const isSelected = this.selectedIngredientA === slot.ingredientId || this.selectedIngredientB === slot.ingredientId;
      const bg = this.add.rectangle(0, 0, cellW - 4, cellH - 2, isSelected ? 0x6a4d8e : 0x3a2d5e)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffcc00 : 0x5544aa);
      const icon = this.add.text(-cellW / 2 + 18, 0, ing.icon, { fontSize: '18px' });
      const nameTxt = this.add.text(8, -8, ing.name, { fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' });
      const qtyTxt = this.add.text(8, 8, `x${slot.quantity}`, { fontSize: '10px', color: '#aaaacc', fontFamily: 'monospace' });

      const cell = this.add.container(x, y, [bg, icon, nameTxt, qtyTxt]);
      cell.setSize(cellW - 4, cellH - 2);
      cell.setInteractive({ useHandCursor: true });

      cell.on('pointerdown', () => {
        this.selectIngredient(slot.ingredientId);
      });

      this.contentContainer.add(cell);
    });

    this.renderSelectedPane(gridStartY + Math.ceil(availableIngredients.length / cols) * (cellH + 4) + 20);
  }

  private renderSelectedPane(startY: number) {
    const state = getGameState();
    const sectionTitle = this.add.text(60, startY, 'Selected Ingredients & Equipment (bottom):', {
      fontSize: '14px', color: '#ccbbff', fontFamily: 'monospace',
    });
    this.contentContainer.add(sectionTitle);

    const paneY = startY + 30;

    const slotW = 180;
    const slotH = 60;

    const slotAColor = this.selectedIngredientA ? 0x6a4d8e : 0x2a1d4e;
    const slotABg = this.add.rectangle(0, 0, slotW, slotH, slotAColor).setStrokeStyle(2, 0x8866aa);
    const slotALabel = this.add.text(0, -15, 'Ingredient A', { fontSize: '10px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);
    const slotAName = this.add.text(0, 5, this.selectedIngredientA ? (getIngredientById(this.selectedIngredientA)?.icon + ' ' + getIngredientById(this.selectedIngredientA)?.name) : '— empty —', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const slotA = this.add.container(200, paneY + slotH / 2, [slotABg, slotALabel, slotAName]);
    this.contentContainer.add(slotA);

    const plusText = this.add.text(310, paneY + slotH / 2, '+', { fontSize: '24px', color: '#ffcc00', fontFamily: 'monospace' }).setOrigin(0.5);
    this.contentContainer.add(plusText);

    const slotBColor = this.selectedIngredientB ? 0x6a4d8e : 0x2a1d4e;
    const slotBBg = this.add.rectangle(0, 0, slotW, slotH, slotBColor).setStrokeStyle(2, 0x8866aa);
    const slotBLabel = this.add.text(0, -15, 'Ingredient B', { fontSize: '10px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);
    const slotBName = this.add.text(0, 5, this.selectedIngredientB ? (getIngredientById(this.selectedIngredientB)?.icon + ' ' + getIngredientById(this.selectedIngredientB)?.name) : '— empty —', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const slotB = this.add.container(420, paneY + slotH / 2, [slotBBg, slotBLabel, slotBName]);
    this.contentContainer.add(slotB);

    const equipY = paneY + slotH + 20;
    const ownedEquip = state.ownedEquipment;
    const eqSlotW = 200;
    const eqSlotH = 50;

    const eqLabel = this.add.text(60, equipY, 'Equipment:', { fontSize: '14px', color: '#ccbbff', fontFamily: 'monospace' });
    this.contentContainer.add(eqLabel);

    ownedEquip.forEach((eqId, i) => {
      const eq = getEquipmentById(eqId);
      if (!eq) return;
      const isSelected = this.selectedEquipment === eqId;
      const bg = this.add.rectangle(0, 0, eqSlotW, eqSlotH, isSelected ? 0x6a4d8e : 0x3a2d5e)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffcc00 : 0x5544aa);
      const icon = this.add.text(-eqSlotW / 2 + 20, 0, eq.icon, { fontSize: '18px' });
      const nameTxt = this.add.text(10, 0, eq.name, { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' });
      const eqSlot = this.add.container(200 + i * (eqSlotW + 10), equipY + 30 + eqSlotH / 2, [bg, icon, nameTxt]);
      eqSlot.setSize(eqSlotW, eqSlotH);
      eqSlot.setInteractive({ useHandCursor: true });
      eqSlot.on('pointerdown', () => {
        this.selectedEquipment = this.selectedEquipment === eqId ? null : eqId;
        this.refreshCraftingUI();
      });
      this.contentContainer.add(eqSlot);
    });

    const craftBtnY = equipY + 100;
    const canCraft = this.selectedIngredientA && this.selectedIngredientB && this.selectedEquipment && !this.isCrafting;

    const craftBg = this.add.rectangle(0, 0, 200, 50, canCraft ? 0x33aa33 : 0x555555)
      .setStrokeStyle(2, canCraft ? 0x66ff66 : 0x777777);
    const craftText = this.add.text(0, 0, this.isCrafting ? '⏳ Brewing...' : '⚒️ CRAFT', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const craftBtn = this.add.container(400, craftBtnY, [craftBg, craftText]);
    craftBtn.setSize(200, 50);
    craftBtn.setInteractive({ useHandCursor: true });

    if (canCraft) {
      craftBtn.on('pointerover', () => craftBg.setFillStyle(0x44bb44));
      craftBtn.on('pointerout', () => craftBg.setFillStyle(0x33aa33));
    }

    craftBtn.on('pointerdown', () => {
      if (canCraft) this.doCraft();
    });
    this.contentContainer.add(craftBtn);
  }

  private selectIngredient(ingredientId: string) {
    if (this.selectedIngredientA === ingredientId) {
      this.selectedIngredientA = null;
    } else if (this.selectedIngredientB === ingredientId) {
      this.selectedIngredientB = null;
    } else if (!this.selectedIngredientA) {
      this.selectedIngredientA = ingredientId;
    } else if (!this.selectedIngredientB) {
      this.selectedIngredientB = ingredientId;
    } else {
      this.selectedIngredientB = this.selectedIngredientA;
      this.selectedIngredientA = ingredientId;
    }
    this.refreshCraftingUI();
  }

  private refreshCraftingUI() {
    this.contentContainer.removeAll(true);
    this.renderCraftingUI();
  }

  private doCraft() {
    if (!this.selectedIngredientA || !this.selectedIngredientB || !this.selectedEquipment || this.isCrafting) return;

    const recipe = findRecipe(this.selectedIngredientA, this.selectedIngredientB, this.selectedEquipment);
    if (!recipe) {
      this.showCraftResult('❌ No recipe found!', 0xff3333);
      return;
    }

    if (getIngredientQuantity(this.selectedIngredientA) < 1 || getIngredientQuantity(this.selectedIngredientB) < 1) {
      this.showCraftResult('❌ Not enough ingredients!', 0xff3333);
      return;
    }

    this.isCrafting = true;
    this.refreshCraftingUI();

    this.time.delayedCall(recipe.craftTime, () => {
      removeIngredient(this.selectedIngredientA!, 1);
      removeIngredient(this.selectedIngredientB!, 1);
      addIngredient(recipe.result, 1);

      const result = getIngredientById(recipe.result);
      this.isCrafting = false;
      this.selectedIngredientA = null;
      this.selectedIngredientB = null;
      this.selectedEquipment = null;

      this.refreshCraftingUI();
      this.emitStateChanged();
      this.showCraftResult(`✅ Crafted ${result?.icon} ${result?.name}!`, 0x33ff33);
    });
  }

  private showCraftResult(message: string, color: number) {
    const text = this.add.text(400, 520, message, {
      fontSize: '16px', color: '#' + color.toString(16).padStart(6, '0'), fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(text);
    this.tweens.add({
      targets: text, alpha: 0, y: text.y - 30, duration: 2000, onComplete: () => text.destroy(),
    });
  }

  private renderInventoryUI() {
    const state = getGameState();
    const baseY = 100;

    const title = this.add.text(400, baseY, '📦 Inventory', {
      fontSize: '20px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const gridStartX = 80;
    const gridStartY = baseY + 50;
    const cols = 5;
    const cellW = 130;
    const cellH = 70;

    state.inventory.forEach((slot, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gridStartX + col * (cellW + 6) + cellW / 2;
      const y = gridStartY + row * (cellH + 6) + cellH / 2;
      const ing = getIngredientById(slot.ingredientId);
      if (!ing) return;

      const bg = this.add.rectangle(0, 0, cellW, cellH, 0x3a2d5e).setStrokeStyle(1, 0x5544aa);
      const icon = this.add.text(0, -12, ing.icon, { fontSize: '22px' }).setOrigin(0.5);
      const nameTxt = this.add.text(0, 8, ing.name, { fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const qtyTxt = this.add.text(0, 22, `x${slot.quantity}`, { fontSize: '10px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);

      const cell = this.add.container(x, y, [bg, icon, nameTxt, qtyTxt]);
      this.contentContainer.add(cell);
    });

    if (state.inventory.length === 0) {
      const empty = this.add.text(400, 300, 'No items yet!', {
        fontSize: '16px', color: '#777799', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
    }
  }

  private renderShopUI() {
    const state = getGameState();
    const baseY = 100;

    const title = this.add.text(400, baseY, '🛒 Shop - Buy Ingredients', {
      fontSize: '20px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const shopItems = INGREDIENTS.filter(i => !i.isCrafted);
    const gridStartX = 80;
    const gridStartY = baseY + 50;
    const cols = 3;
    const cellW = 220;
    const cellH = 80;

    shopItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gridStartX + col * (cellW + 10) + cellW / 2;
      const y = gridStartY + row * (cellH + 10) + cellH / 2;

      const canAfford = state.money >= item.basePrice;
      const bg = this.add.rectangle(0, 0, cellW, cellH, canAfford ? 0x3a2d5e : 0x2a1d3e)
        .setStrokeStyle(1, canAfford ? 0x5544aa : 0x333355);
      const icon = this.add.text(-cellW / 2 + 25, 0, item.icon, { fontSize: '22px' }).setOrigin(0.5);
      const nameTxt = this.add.text(0, -15, item.name, { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const priceTxt = this.add.text(0, 5, `${item.basePrice}g`, { fontSize: '11px', color: '#ffcc00', fontFamily: 'monospace' }).setOrigin(0.5);
      const buyLabel = this.add.text(0, 22, canAfford ? '[ BUY ]' : '[ can\'t afford ]', {
        fontSize: '10px', color: canAfford ? '#66ff66' : '#ff6666', fontFamily: 'monospace',
      }).setOrigin(0.5);

      const cell = this.add.container(x, y, [bg, icon, nameTxt, priceTxt, buyLabel]);
      cell.setSize(cellW, cellH);

      if (canAfford) {
        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerover', () => bg.setFillStyle(0x4a3d6e));
        cell.on('pointerout', () => bg.setFillStyle(0x3a2d5e));
        cell.on('pointerdown', () => {
          const gs = getGameState();
          if (gs.money >= item.basePrice) {
            this.scene.get('HUDScene').events.emit('state-changed');
            const removed = (() => {
              const s = getGameState();
              if (s.money < item.basePrice) return false;
              s.money -= item.basePrice;
              addIngredient(item.id, 1);
              return true;
            })();
            if (removed) {
              this.emitStateChanged();
              this.contentContainer.removeAll(true);
              this.renderShopUI();
            }
          }
        });
      }

      this.contentContainer.add(cell);
    });
  }

  private renderCustomerUI() {
    const state = getGameState();
    const baseY = 100;

    const title = this.add.text(400, baseY, '🧑‍🤝‍🧑 Customers', {
      fontSize: '20px', color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    if (state.activeCustomers.length === 0) {
      const empty = this.add.text(400, 300, 'No customers right now. Check back later!', {
        fontSize: '14px', color: '#777799', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.contentContainer.add(empty);

      const refreshBtn = this.add.rectangle(0, 0, 160, 40, 0x4a2d6e).setStrokeStyle(2, 0x8866aa);
      const refreshTxt = this.add.text(0, 0, '🔄 New Customers', { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const refresh = this.add.container(400, 360, [refreshBtn, refreshTxt]);
      refresh.setSize(160, 40);
      refresh.setInteractive({ useHandCursor: true });
      refresh.on('pointerdown', () => {
        addCustomer();
        addCustomer();
        this.contentContainer.removeAll(true);
        this.renderCustomerUI();
      });
      this.contentContainer.add(refresh);
      return;
    }

    state.activeCustomers.forEach((customer, i) => {
      const y = baseY + 60 + i * 110;
      const requestedItem = getIngredientById(customer.requestedItemId);
      const hasItem = getIngredientQuantity(customer.requestedItemId) > 0;

      const bg = this.add.rectangle(0, 0, 680, 90, 0x3a2d5e).setStrokeStyle(1, 0x5544aa);
      const portrait = this.add.text(-300, 0, customer.portrait, { fontSize: '32px' }).setOrigin(0.5);
      const nameTxt = this.add.text(-220, -20, customer.name, { fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' });
      const wantTxt = this.add.text(-220, 5, `Wants: ${requestedItem?.icon} ${requestedItem?.name}`, {
        fontSize: '12px', color: '#ccbbff', fontFamily: 'monospace',
      });
      const rewardTxt = this.add.text(-220, 25, `Reward: ${customer.reward}g`, {
        fontSize: '11px', color: '#ffcc00', fontFamily: 'monospace',
      });

      const card = this.add.container(400, y, [bg, portrait, nameTxt, wantTxt, rewardTxt]);
      this.contentContainer.add(card);

      if (hasItem) {
        const sellBg = this.add.rectangle(280, 0, 80, 36, 0x33aa33).setStrokeStyle(1, 0x66ff66);
        const sellTxt = this.add.text(280, 0, 'SELL', { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
        const sellBtn = this.add.container(0, 0, [sellBg, sellTxt]);
        sellBtn.setSize(80, 36);
        sellBtn.setInteractive({ useHandCursor: true });
        card.add(sellBtn);
        sellBtn.on('pointerdown', () => {
          removeIngredient(customer.requestedItemId, 1);
          addMoney(customer.reward);
          removeCustomer(customer.id);
          addCustomer();
          this.emitStateChanged();
          this.contentContainer.removeAll(true);
          this.renderCustomerUI();
        });
      } else {
        const needTxt = this.add.text(280, 0, 'Need item', { fontSize: '10px', color: '#ff6666', fontFamily: 'monospace' }).setOrigin(0.5);
        card.add(needTxt);
      }
    });
  }
}