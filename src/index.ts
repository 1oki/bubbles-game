import  { Application, Assets, Texture } from "pixi.js";
import Game from './Game';

const app: Application = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
});

const bubbleTexture:Texture = await Assets.load('../assets/bubble.png');
const startButtonTexture:Texture = await Assets.load('../assets/startBtn.png');

document.body.appendChild(app.canvas);

const game:Game = new Game(app, bubbleTexture, startButtonTexture);
