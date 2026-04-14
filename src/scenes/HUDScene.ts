import Phaser from 'phaser';
import { getGameState } from '../data/gameState';

export class HUDScene extends Phaser.Scene {
  private moneyText!: Phaser.GameObjects.Text;
  private tabContainers: { key: string; container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Rectangle }[] = [];

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.moneyText = this.add.text(0, 0, '', {
      fontSize: '16px',
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

    tabs.forEach(tab => {
      const bg = this.add.rectangle(0, 0, 1, 1, 0x4a2d6e, 0.9)
        .setStrokeStyle(2, 0x8866aa)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, tab.label, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      const container = this.add.container(0, 0, [bg, text]);

      bg.on('pointerover', () => bg.setFillStyle(0x6a4d8e, 0.9));
      bg.on('pointerout', () => bg.setFillStyle(0x4a2d6e, 0.9));
      bg.on('pointerdown', () => {
        this.scene.get('UIScene').events.emit('open-tab', tab.key);
      });

      this.tabContainers.push({ key: tab.key, container, bg });
    });

    this.layoutHUD();
    this.updateHUD();
    this.scene.get('UIScene').events.on('state-changed', this.updateHUD, this);
    this.scale.on('resize', () => this.layoutHUD());
  }

  private layoutHUD() {
    const w = this.scale.width;
    const pad = 12;
    const btnHeight = 44;
    const gap = 6;
    const tabCount = this.tabContainers.length;
    const btnWidth = Math.floor((w - pad * 2 - gap * (tabCount - 1)) / tabCount);

    // Money text: full width, top-left, stays below tabs
    this.moneyText.setPosition(pad, 6);

    // Tabs: row below money, full width
    const tabsY = 34 + btnHeight / 2;

    this.tabContainers.forEach((tab, i) => {
      const x = pad + i * (btnWidth + gap) + btnWidth / 2;
      tab.container.setPosition(x, tabsY);
      tab.bg.setSize(btnWidth, btnHeight);
    });
  }

  updateHUD() {
    const state = getGameState();
    this.moneyText.setText(`💰 ${state.money}g`);
  }
}