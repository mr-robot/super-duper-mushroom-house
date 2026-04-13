import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private bgGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.bgGraphics = this.add.graphics();
    this.drawScene();

    this.scene.launch('HUDScene');
    this.scene.launch('UIScene');

    this.scale.on('resize', () => this.drawScene());
  }

  private drawScene() {
    const w = this.scale.width;
    const h = this.scale.height;
    const g = this.bgGraphics;
    g.clear();

    const cx = w / 2;
    const groundY = h * 0.58;
    const houseScale = Math.min(w / 800, h / 700);

    g.fillStyle(0x2d1b4e, 1);
    g.fillRect(0, 0, w, h);

    g.fillStyle(0x3d2b5e, 1);
    g.fillRect(0, groundY, w, h - groundY);

    g.fillStyle(0x8b5e3c);
    g.fillRect(cx - 50 * houseScale, groundY - 70 * houseScale, 100 * houseScale, 120 * houseScale);
    g.fillStyle(0x6b3e1c);
    g.fillRect(cx - 5 * houseScale, groundY - 10 * houseScale, 30 * houseScale, 60 * houseScale);

    g.fillStyle(0xcc3333);
    g.fillEllipse(cx, groundY - 90 * houseScale, 220 * houseScale, 140 * houseScale);

    g.fillStyle(0xeeeeee);
    g.fillCircle(cx - 40 * houseScale, groundY - 120 * houseScale, 20 * houseScale);
    g.fillCircle(cx + 30 * houseScale, groundY - 130 * houseScale, 25 * houseScale);
    g.fillCircle(cx + 5 * houseScale, groundY - 100 * houseScale, 15 * houseScale);
    g.fillCircle(cx - 20 * houseScale, groundY - 90 * houseScale, 12 * houseScale);

    g.fillStyle(0xffee88);
    const winX = cx - 20 * houseScale;
    const winY = groundY - 10 * houseScale;
    const winW = 40 * houseScale;
    const winH = 40 * houseScale;
    g.fillRect(winX, winY, winW, winH);
    g.fillStyle(0x8b5e3c);
    g.fillRect(winX, winY, winW, 4 * houseScale);
    g.fillRect(winX, winY, 4 * houseScale, winH);
    g.fillRect(winX, winY + winH - 4 * houseScale, winW, 4 * houseScale);
    g.fillRect(winX + winW - 4 * houseScale, winY, 4 * houseScale, winH);

    const bushRadius = Math.max(25, 40 * houseScale);
    const bushPositions = [
      { x: w * 0.15, y: groundY + 30, cap: 0xcc5555 },
      { x: w * 0.85, y: groundY + 20, cap: 0xcc5555 },
    ];
    bushPositions.forEach(b => {
      g.fillStyle(0x33aa33);
      g.fillCircle(b.x, b.y, bushRadius);
      g.fillStyle(b.cap);
      g.fillCircle(b.x, b.y - 5, bushRadius * 0.3);
    });

    const mushroomPositions = [
      { x: w * 0.12, y: h * 0.78, cap: 0xdd6633 },
      { x: w * 0.75, y: h * 0.76, cap: 0x33bb33 },
      { x: w * 0.55, y: h * 0.82, cap: 0x6666dd },
    ];
    mushroomPositions.forEach(m => {
      const ms = houseScale;
      g.fillStyle(0xccbb99);
      g.fillRect(m.x - 5 * ms, m.y, 10 * ms, 20 * ms);
      g.fillStyle(m.cap);
      g.fillEllipse(m.x, m.y, 30 * ms, 20 * ms);
    });

    g.fillStyle(0xccccff, 0.3);
    g.fillCircle(w * 0.12, h * 0.12, 25);
    g.fillCircle(w * 0.35, h * 0.08, 18);
    g.fillCircle(w * 0.75, h * 0.1, 22);
    g.fillCircle(w * 0.9, h * 0.15, 14);
  }
}
