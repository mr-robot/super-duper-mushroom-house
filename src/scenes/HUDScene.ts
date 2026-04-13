import Phaser from 'phaser';
import { getGameState } from '../data/gameState';

export class HUDScene extends Phaser.Scene {
  private moneyText!: Phaser.GameObjects.Text;
  private craftBtn!: Phaser.GameObjects.Container;
  private inventoryBtn!: Phaser.GameObjects.Container;
  private shopBtn!: Phaser.GameObjects.Container;
  private customerBtn!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.moneyText = this.add.text(20, 15, '', {
      fontSize: '18px',
      color: '#ffcc00',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });

    const tabs = [
      { label: 'Craft', key: 'craft' },
      { label: 'Inventory', key: 'inventory' },
      { label: 'Shop', key: 'shop' },
      { label: 'Customers', key: 'customers' },
    ];

    const btnWidth = 120;
    const btnHeight = 36;
    const startX = 800 - (tabs.length * (btnWidth + 8)) - 10;
    const y = 10;

    tabs.forEach((tab, i) => {
      const x = startX + i * (btnWidth + 8);
      const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x4a2d6e, 0.9)
        .setStrokeStyle(2, 0x8866aa);
      const text = this.add.text(0, 0, tab.label, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      const container = this.add.container(x + btnWidth / 2, y + btnHeight / 2, [bg, text]);
      container.setSize(btnWidth, btnHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => bg.setFillStyle(0x6a4d8e, 0.9));
      container.on('pointerout', () => bg.setFillStyle(0x4a2d6e, 0.9));
      container.on('pointerdown', () => {
        this.scene.get('UIScene').events.emit('open-tab', tab.key);
      });

      if (tab.key === 'craft') this.craftBtn = container;
      if (tab.key === 'inventory') this.inventoryBtn = container;
      if (tab.key === 'shop') this.shopBtn = container;
      if (tab.key === 'customers') this.customerBtn = container;
    });

    this.updateHUD();
    this.scene.get('UIScene').events.on('state-changed', this.updateHUD, this);
  }

  updateHUD() {
    const state = getGameState();
    this.moneyText.setText(`💰 ${state.money}g`);
  }
}