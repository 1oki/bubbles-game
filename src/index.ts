import  { Application, Assets, Texture } from "pixi.js";
import Game from './Game';

const gameContainer = document.getElementById("container");
if (!gameContainer) {
    console.error("Game container not found!");
}
const { width, height } = gameContainer.getBoundingClientRect();

let appHeight = 600;
let tileSize  = 50;

const gridSize = 7;

if(width < 640) {
  tileSize = width/10;
  appHeight = width;
}
if(width < 500) {
  tileSize = width/7;
  appHeight = width*1.25;
}
if(width < 400) {
  tileSize = width/7;
  appHeight = width*1.5;
}


const app: Application = new Application();
await app.init({
  width: width,
  height: appHeight,
  backgroundColor: 0x0D7A96,
});

const bubbleTexture:Texture = await Assets.load('../assets/bubble.png');
const startButtonTexture:Texture = await Assets.load('../assets/startBtn.png');

document.getElementById("container").appendChild(app.canvas);

const game:Game = new Game(app, tileSize, gridSize ,bubbleTexture, startButtonTexture);
