import { Sprite, Texture } from "pixi.js";

class Tile extends Sprite {
    public gridX: number;
    public gridY: number;
    public color: string;
    public tileSize: number;
    public isPlaceholder: boolean;

    constructor(texture: Texture, x: number, y: number, tileSize: number, color: string) {
        super(texture);
        this.gridX = x;
        this.gridY = y;
        this.color  = color;
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.width = tileSize;
        this.height = tileSize;
        this.interactive = true;
        this.tint = color;
    }
}

export default Tile;