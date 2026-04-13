import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.drawMushroomHouse();

    this.scene.launch('HUDScene');
    this.scene.launch('UIScene');
  }

  private drawMushroomHouse() {
    const cx = 400;
    const g = this.add.graphics();

    g.fillStyle(0x2d1b4e, 1);
    g.fillRect(0, 0, 800, 600);

    g.fillStyle(0x3d2b5e, 1);
    g.fillRect(0, 350, 800, 250);

    g.fillStyle(0x8b5e3c);
    g.fillRect(cx - 50, 280, 100, 120);
    g.fillStyle(0x6b3e1c);
    g.fillRect(cx - 5, 340, 30, 60);

    g.fillStyle(0xcc3333);
    g.fillEllipse(cx, 260, 220, 140);

    g.fillStyle(0xeeeeee);
    g.fillCircle(cx - 40, 230, 20);
    g.fillCircle(cx + 30, 220, 25);
    g.fillCircle(cx + 5, 250, 15);
    g.fillCircle(cx - 20, 260, 12);

    g.fillStyle(0xffee88);
    g.fillRect(cx - 20, 340, 40, 40);
    g.fillStyle(0x8b5e3c);
    g.fillRect(cx - 20, 340, 40, 4);
    g.fillRect(cx - 20, 340, 4, 40);
    g.fillRect(cx - 20, 376, 40, 4);
    g.fillRect(cx + 16, 340, 4, 40);

    g.fillStyle(0x33aa33);
    g.fillCircle(150, 380, 40);
    g.fillCircle(650, 370, 45);
    g.fillCircle(700, 400, 30);

    g.fillStyle(0xcc5555);
    g.fillCircle(150, 375, 12);
    g.fillCircle(650, 365, 14);
    g.fillCircle(700, 395, 10);

    const mushrooms = [
      { x: 120, y: 450, cap: 0xdd6633 },
      { x: 680, y: 440, cap: 0x33bb33 },
      { x: 550, y: 470, cap: 0x6666dd },
    ];
    mushrooms.forEach(m => {
      g.fillStyle(0xccbb99);
      g.fillRect(m.x - 5, m.y, 10, 20);
      g.fillStyle(m.cap);
      g.fillEllipse(m.x, m.y, 30, 20);
    });

    g.fillStyle(0xccccff, 0.3);
    g.fillCircle(100, 80, 30);
    g.fillCircle(300, 50, 20);
    g.fillCircle(600, 70, 25);
    g.fillCircle(700, 100, 15);
  }
}