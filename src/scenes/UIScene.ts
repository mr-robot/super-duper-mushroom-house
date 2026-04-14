import Phaser from 'phaser';
import { getGameState, addIngredient, removeIngredient, addMoney, removeCustomer, addCustomer, getIngredientQuantity } from '../data/gameState';
import { INGREDIENTS, getIngredientById } from '../data/ingredients';
import { findRecipe } from '../data/recipes';
import { getEquipmentById } from '../data/equipment';

type TabKey = 'craft' | 'inventory' | 'shop' | 'customers' | null;

interface Layout {
  w: number;
  h: number;
  cx: number;
  pad: number;
  panelX: number;
  panelY: number;
  panelW: number;
  panelH: number;
  fontSize: string;
  smallFont: string;
  titleFont: string;
  cellW: number;
  cellH: number;
  cols: number;
}

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

    this.tabBg = this.add.rectangle(0, 0, 1, 1, 0x1a0e2e, 0.95)
      .setStrokeStyle(2, 0x8866aa);
    this.panelContainer.add(this.tabBg);

    const closeBg = this.add.rectangle(0, 0, 28, 28, 0xcc3333);
    const closeTxt = this.add.text(0, 0, 'X', { fontSize: '14px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5);
    this.closeBtn = this.add.container(0, 0, [closeBg, closeTxt]);
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

    this.scale.on('resize', () => {
      this.layoutPanel();
      if (this.currentTab) {
        this.contentContainer.removeAll(true);
        switch (this.currentTab) {
          case 'craft': this.renderCraftingUI(); break;
          case 'inventory': this.renderInventoryUI(); break;
          case 'shop': this.renderShopUI(); break;
          case 'customers': this.renderCustomerUI(); break;
        }
      }
    });

    this.layoutPanel();
  }

  private getLayout(): Layout {
    const w = this.scale.width;
    const h = this.scale.height;
    const pad = 12;
    const panelX = pad;
    const panelY = 84; // Below HUD tab row (tabs end at ~78)
    const panelW = w - pad * 2;
    const panelH = h - panelY - pad;
    const fontSize = w < 500 ? '10px' : '14px';
    const smallFont = w < 500 ? '8px' : '10px';
    const titleFont = w < 500 ? '16px' : '20px';
    const cellW = Math.min(140, (panelW - pad * 2) / 5);
    const cellH = w < 500 ? 44 : 50;
    const cols = Math.max(2, Math.min(5, Math.floor((panelW - pad) / (cellW + 4))));
    return { w, h, cx: w / 2, pad, panelX, panelY, panelW, panelH, fontSize, smallFont, titleFont, cellW, cellH, cols };
  }

  private layoutPanel() {
    const l = this.getLayout();
    this.tabBg.setPosition(l.cx, l.panelY + l.panelH / 2);
    this.tabBg.setSize(l.panelW, l.panelH);
    this.closeBtn.setPosition(l.panelX + l.panelW - 20, l.panelY + 20);
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
    const l = this.getLayout();
    const baseY = l.panelY + 30;

    const title = this.add.text(l.cx, baseY, '🫕 Cauldron Crafting', {
      fontSize: l.titleFont, color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const sectionY = baseY + 30;
    const sectionTitle = this.add.text(l.panelX + l.pad, sectionY, 'Select Ingredients:', {
      fontSize: l.fontSize, color: '#ccbbff', fontFamily: 'monospace',
    });
    this.contentContainer.add(sectionTitle);

    const availableIngredients = state.inventory.filter(s => s.quantity > 0);
    const gridStartX = l.panelX + l.pad;
    const gridStartY = sectionY + 22;

    availableIngredients.forEach((slot, i) => {
      const col = i % l.cols;
      const row = Math.floor(i / l.cols);
      const x = gridStartX + col * (l.cellW + 4) + l.cellW / 2;
      const y = gridStartY + row * (l.cellH + 4) + l.cellH / 2;
      const ing = getIngredientById(slot.ingredientId);
      if (!ing) return;

      const isSelected = this.selectedIngredientA === slot.ingredientId || this.selectedIngredientB === slot.ingredientId;
      const bg = this.add.rectangle(0, 0, l.cellW - 4, l.cellH - 2, isSelected ? 0x6a4d8e : 0x3a2d5e)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffcc00 : 0x5544aa);
      const icon = this.add.text(-l.cellW / 2 + 18, 0, ing.icon, { fontSize: '16px' });
      const nameTxt = this.add.text(8, -8, ing.name, { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' });
      const qtyTxt = this.add.text(8, 8, `x${slot.quantity}`, { fontSize: '8px', color: '#aaaacc', fontFamily: 'monospace' });

      const cell = this.add.container(x, y, [bg, icon, nameTxt, qtyTxt]);
      cell.setSize(l.cellW - 4, l.cellH - 2);
      cell.setInteractive({ useHandCursor: true });

      cell.on('pointerdown', () => {
        this.selectIngredient(slot.ingredientId);
      });

      this.contentContainer.add(cell);
    });

    const nextY = gridStartY + Math.ceil(availableIngredients.length / l.cols) * (l.cellH + 4) + 12;
    this.renderSelectedPane(nextY, l);
  }

  private renderSelectedPane(startY: number, l: Layout) {
    const state = getGameState();
    const sectionTitle = this.add.text(l.panelX + l.pad, startY, 'Selected & Equipment:', {
      fontSize: l.fontSize, color: '#ccbbff', fontFamily: 'monospace',
    });
    this.contentContainer.add(sectionTitle);

    const paneY = startY + 22;
    const isNarrow = l.w < 420;
    const slotW = Math.min(180, (l.panelW - l.pad * 2 - 20) / (isNarrow ? 1 : 2));
    const slotH = 44;
    const slotSpacing = isNarrow ? 6 : (l.panelW - l.pad * 2 - slotW * 2);
    const slotAX = l.panelX + l.pad + slotW / 2;
    const slotBX = isNarrow ? slotAX : slotAX + slotW + slotSpacing;
    const slotCenterX = l.cx;

    const slotAColor = this.selectedIngredientA ? 0x6a4d8e : 0x2a1d4e;
    const slotABg = this.add.rectangle(0, 0, slotW, slotH, slotAColor).setStrokeStyle(2, 0x8866aa);
    const slotALabel = this.add.text(0, -12, 'Ingredient A', { fontSize: '8px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);
    const slotAName = this.add.text(0, 5, this.selectedIngredientA ? (getIngredientById(this.selectedIngredientA)?.icon + ' ' + getIngredientById(this.selectedIngredientA)?.name) : '— empty —', {
      fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const slotA = this.add.container(slotAX, paneY + slotH / 2, [slotABg, slotALabel, slotAName]);
    this.contentContainer.add(slotA);

    const plusText = this.add.text(slotCenterX, paneY + slotH / 2, '+', { fontSize: '20px', color: '#ffcc00', fontFamily: 'monospace' }).setOrigin(0.5);
    this.contentContainer.add(plusText);

    const slotBColor = this.selectedIngredientB ? 0x6a4d8e : 0x2a1d4e;
    const slotBBg = this.add.rectangle(0, 0, slotW, slotH, slotBColor).setStrokeStyle(2, 0x8866aa);
    const slotBLabel = this.add.text(0, -12, 'Ingredient B', { fontSize: '8px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);
    const slotBName = this.add.text(0, 5, this.selectedIngredientB ? (getIngredientById(this.selectedIngredientB)?.icon + ' ' + getIngredientById(this.selectedIngredientB)?.name) : '— empty —', {
      fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const slotBY = isNarrow ? paneY + slotH + 12 : paneY + slotH / 2;
    const slotB = this.add.container(slotBX, slotBY, [slotBBg, slotBLabel, slotBName]);
    this.contentContainer.add(slotB);

    if (isNarrow) {
      plusText.setVisible(false);
    }

    const equipY = paneY + slotH + 12;
    const ownedEquip = state.ownedEquipment;
    const eqSlotW = Math.min(200, l.panelW - l.pad * 2);
    const eqSlotH = 44;
    const equipYAdjust = isNarrow ? 20 : 24;
    const equipY2 = isNarrow ? paneY + slotH + 12 + slotH + 12 : equipY;

    const eqLabel = this.add.text(l.panelX + l.pad, equipY2, 'Equipment:', { fontSize: l.fontSize, color: '#ccbbff', fontFamily: 'monospace' });
    this.contentContainer.add(eqLabel);

    ownedEquip.forEach((eqId) => {
      const eq = getEquipmentById(eqId);
      if (!eq) return;
      const isSelected = this.selectedEquipment === eqId;
      const bg = this.add.rectangle(0, 0, eqSlotW, eqSlotH, isSelected ? 0x6a4d8e : 0x3a2d5e)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffcc00 : 0x5544aa);
      const icon = this.add.text(-eqSlotW / 2 + 20, 0, eq.icon, { fontSize: '16px' });
      const nameTxt = this.add.text(10, 0, eq.name, { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' });
      const eqSlot = this.add.container(l.cx, equipY2 + equipYAdjust + eqSlotH / 2, [bg, icon, nameTxt]);
      eqSlot.setSize(eqSlotW, eqSlotH);
      eqSlot.setInteractive({ useHandCursor: true });
      eqSlot.on('pointerdown', () => {
        this.selectedEquipment = this.selectedEquipment === eqId ? null : eqId;
        this.refreshCraftingUI();
      });
      this.contentContainer.add(eqSlot);
    });

    const craftBtnY = equipY2 + equipYAdjust + eqSlotH + (isNarrow ? 24 : 36);
    const canCraft = this.selectedIngredientA && this.selectedIngredientB && this.selectedEquipment && !this.isCrafting;
    const craftBtnW = Math.min(200, l.panelW - l.pad * 2);

    const craftBg = this.add.rectangle(0, 0, craftBtnW, 44, canCraft ? 0x33aa33 : 0x555555)
      .setStrokeStyle(2, canCraft ? 0x66ff66 : 0x777777);
    const craftText = this.add.text(0, 0, this.isCrafting ? '⏳ Brewing...' : '⚒️ CRAFT', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);
    const craftBtn = this.add.container(l.cx, craftBtnY, [craftBg, craftText]);
    craftBtn.setSize(craftBtnW, 44);
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
    const l = this.getLayout();
    const text = this.add.text(l.cx, l.panelY + l.panelH - 30, message, {
      fontSize: l.fontSize, color: '#' + color.toString(16).padStart(6, '0'), fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(text);
    this.tweens.add({
      targets: text, alpha: 0, y: text.y - 30, duration: 2000, onComplete: () => text.destroy(),
    });
  }

  private renderInventoryUI() {
    const state = getGameState();
    const l = this.getLayout();
    const baseY = l.panelY + 30;

    const title = this.add.text(l.cx, baseY, '📦 Inventory', {
      fontSize: l.titleFont, color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const gridStartX = l.panelX + l.pad;
    const gridStartY = baseY + 40;
    const invCellW = Math.min(130, (l.panelW - l.pad * 2) / l.cols);
    const invCellH = 64;

    state.inventory.forEach((slot, i) => {
      const col = i % l.cols;
      const row = Math.floor(i / l.cols);
      const x = gridStartX + col * (invCellW + 6) + invCellW / 2;
      const y = gridStartY + row * (invCellH + 6) + invCellH / 2;
      const ing = getIngredientById(slot.ingredientId);
      if (!ing) return;

      const bg = this.add.rectangle(0, 0, invCellW, invCellH, 0x3a2d5e).setStrokeStyle(1, 0x5544aa);
      const icon = this.add.text(0, -10, ing.icon, { fontSize: '20px' }).setOrigin(0.5);
      const nameTxt = this.add.text(0, 8, ing.name, { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const qtyTxt = this.add.text(0, 20, `x${slot.quantity}`, { fontSize: '8px', color: '#aaaacc', fontFamily: 'monospace' }).setOrigin(0.5);

      const cell = this.add.container(x, y, [bg, icon, nameTxt, qtyTxt]);
      this.contentContainer.add(cell);
    });

    if (state.inventory.length === 0) {
      const empty = this.add.text(l.cx, l.panelY + l.panelH / 2, 'No items yet!', {
        fontSize: '16px', color: '#777799', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
    }
  }

  private renderShopUI() {
    const state = getGameState();
    const l = this.getLayout();
    const baseY = l.panelY + 30;

    const title = this.add.text(l.cx, baseY, '🛒 Shop', {
      fontSize: l.titleFont, color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    const shopItems = INGREDIENTS.filter(i => !i.isCrafted);
    const gridStartX = l.panelX + l.pad;
    const gridStartY = baseY + 40;
    const shopCols = Math.max(2, Math.min(3, Math.floor((l.panelW - l.pad) / (220 + 10))));
    const shopCellW = Math.min(220, (l.panelW - l.pad * 2 - (shopCols - 1) * 10) / shopCols);
    const shopCellH = 72;

    shopItems.forEach((item, i) => {
      const col = i % shopCols;
      const row = Math.floor(i / shopCols);
      const x = gridStartX + col * (shopCellW + 10) + shopCellW / 2;
      const y = gridStartY + row * (shopCellH + 10) + shopCellH / 2;

      const canAfford = state.money >= item.basePrice;
      const bg = this.add.rectangle(0, 0, shopCellW, shopCellH, canAfford ? 0x3a2d5e : 0x2a1d3e)
        .setStrokeStyle(1, canAfford ? 0x5544aa : 0x333355);
      const icon = this.add.text(-shopCellW / 2 + 25, 0, item.icon, { fontSize: '20px' }).setOrigin(0.5);
      const nameTxt = this.add.text(0, -14, item.name, { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const priceTxt = this.add.text(0, 4, `${item.basePrice}g`, { fontSize: l.smallFont, color: '#ffcc00', fontFamily: 'monospace' }).setOrigin(0.5);
      const buyLabel = this.add.text(0, 20, canAfford ? '[ BUY ]' : '[ can\'t afford ]', {
        fontSize: '8px', color: canAfford ? '#66ff66' : '#ff6666', fontFamily: 'monospace',
      }).setOrigin(0.5);

      const cell = this.add.container(x, y, [bg, icon, nameTxt, priceTxt, buyLabel]);
      cell.setSize(shopCellW, shopCellH);

      if (canAfford) {
        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerover', () => bg.setFillStyle(0x4a3d6e));
        cell.on('pointerout', () => bg.setFillStyle(0x3a2d5e));
        cell.on('pointerdown', () => {
          const gs = getGameState();
          if (gs.money >= item.basePrice) {
            this.scene.get('HUDScene').events.emit('state-changed');
            const s = getGameState();
            if (s.money < item.basePrice) return;
            s.money -= item.basePrice;
            addIngredient(item.id, 1);
            this.emitStateChanged();
            this.contentContainer.removeAll(true);
            this.renderShopUI();
          }
        });
      }

      this.contentContainer.add(cell);
    });
  }

  private renderCustomerUI() {
    const state = getGameState();
    const l = this.getLayout();
    const baseY = l.panelY + 30;

    const title = this.add.text(l.cx, baseY, '🧑‍🤝‍🧑 Customers', {
      fontSize: l.titleFont, color: '#ffcc00', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.contentContainer.add(title);

    if (state.activeCustomers.length === 0) {
      const empty = this.add.text(l.cx, l.panelY + l.panelH / 2, 'No customers right now!', {
        fontSize: l.fontSize, color: '#777799', fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.contentContainer.add(empty);

      const refreshBtnBg = this.add.rectangle(0, 0, 160, 40, 0x4a2d6e).setStrokeStyle(2, 0x8866aa);
      const refreshTxt = this.add.text(0, 0, '🔄 New Customers', { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
      const refresh = this.add.container(l.cx, l.panelY + l.panelH / 2 + 50, [refreshBtnBg, refreshTxt]);
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

    const cardW = l.panelW - l.pad * 2;
    const cardH = Math.min(90, l.panelH / 5);
    const cardX = l.cx;

    state.activeCustomers.forEach((customer, i) => {
      const y = baseY + 30 + i * (cardH + 10);
      const requestedItem = getIngredientById(customer.requestedItemId);
      const hasItem = getIngredientQuantity(customer.requestedItemId) > 0;

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x3a2d5e).setStrokeStyle(1, 0x5544aa);
      const portrait = this.add.text(-cardW / 2 + 35, 0, customer.portrait, { fontSize: '26px' }).setOrigin(0.5);
      const nameTxt = this.add.text(-cardW / 2 + 70, -cardH * 0.2, customer.name, { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' });
      const wantTxt = this.add.text(-cardW / 2 + 70, 2, `Wants: ${requestedItem?.icon} ${requestedItem?.name}`, {
        fontSize: '8px', color: '#ccbbff', fontFamily: 'monospace',
      });
      const rewardTxt = this.add.text(-cardW / 2 + 70, cardH * 0.2, `Reward: ${customer.reward}g`, {
        fontSize: '8px', color: '#ffcc00', fontFamily: 'monospace',
      });

      const card = this.add.container(cardX, y, [bg, portrait, nameTxt, wantTxt, rewardTxt]);
      this.contentContainer.add(card);

      if (hasItem) {
        const sellBtnX = cardW / 2 - 50;
        const sellBg = this.add.rectangle(0, 0, 80, 34, 0x33aa33).setStrokeStyle(1, 0x66ff66);
        const sellTxt = this.add.text(0, 0, 'SELL', { fontSize: l.smallFont, color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0.5);
        const sellBtn = this.add.container(sellBtnX, 0, [sellBg, sellTxt]);
        sellBtn.setSize(80, 34);
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
        const needTxt = this.add.text(cardW / 2 - 50, 0, 'Need item', { fontSize: '8px', color: '#ff6666', fontFamily: 'monospace' }).setOrigin(0.5);
        card.add(needTxt);
      }
    });
  }
}
