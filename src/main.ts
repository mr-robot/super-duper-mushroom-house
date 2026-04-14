import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { HUDScene } from './scenes/HUDScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  backgroundColor: '#1a0e2e',
  parent: document.body,
  scene: [MainScene, HUDScene, UIScene],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: Phaser.Scale.MAX_ZOOM,
  },
  input: {
    touch: { capture: true },
  },
};

const game = new Phaser.Game(config);

export { game };
