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
        .setStrokeStyle(2, 0x8866aa);
      const text = this.add.text(0, 0, tab.label, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      const container = this.add.container(0, 0, [bg, text]);
      container.setSize(1, 1);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => bg.setFillStyle(0x6a4d8e, 0.9));
      container.on('pointerout', () => bg.setFillStyle(0x4a2d6e, 0.9));
      container.on('pointerdown', () => {
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
    const padding = 10;
    const btnHeight = 36;
    const gap = 6;
    const tabCount = this.tabContainers.length;
    const btnWidth = (w - padding * 2 - gap * (tabCount - 1)) / tabCount;
    const y = padding + btnHeight / 2;

    this.moneyText.setPosition(padding, padding + 2);

    this.tabContainers.forEach((tab, i) => {
      const x = padding + i * (btnWidth + gap) + btnWidth / 2;
      tab.container.setPosition(x, y);
      tab.container.setSize(btnWidth, btnHeight);
      tab.bg.setSize(btnWidth, btnHeight);
    });
  }

  updateHUD() {
    const state = getGameState();
    this.moneyText.setText(`💰 ${state.money}g`);
  }
}
