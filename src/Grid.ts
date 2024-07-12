import { Application, Container, FederatedPointerEvent, Texture } from "pixi.js";
import { sound } from '@pixi/sound';
import gsap from 'gsap';
import Tile from './Tile';


class Grid {
    private gridSize: number;
    private tileSize: number;
    private colors: string[];
    private texture: Texture;
    private app: Application;
    private updateScore: (points: number) => void;
    public container: Container;
    private grid: Tile[][];
    private selectedTile: Tile | null;

    constructor(gridSize: number, tileSize: number, colors: string[], texture:Texture, app:Application, updateScore:(points:number) => void) {
        this.gridSize = gridSize;
        this.tileSize = tileSize;
        this.colors = colors;
        this.texture = texture;
        this.app = app;
        this.container = new Container();
        this.container.x = (this.app.screen.width - this.container.width) / 4;
        this.container.y = (this.app.screen.height - this.container.height) / 4;
        this.grid = [];
        this.selectedTile = null;
        this.updateScore = updateScore;
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        app.stage.addChild(this.container);
        this.container.on('pointerdown', this.onTileClick.bind(this));
    }

    public createGrid():void {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < this.gridSize; x++) {
                const tile = this.createTile(x, y);
                row.push(tile);
            }
            this.grid.push(row);
        }
        this.checkMatches(this.grid);
        if (!this.hasPossibleMoves()) {
            this.shuffleBoard();
        }
    }

    private createTile(x:number, y:number): Tile {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const tile = new Tile(this.texture, x, y, this.tileSize, color);
        this.container.addChild(tile);
        return tile;
    }

    private onTileClick(event: FederatedPointerEvent): void {
        sound.play('click');

        const tile = event.target as Tile;
        if (this.selectedTile) {
            this.selectedTile.alpha = 1;
            this.swapTiles(this.selectedTile, tile);
            this.selectedTile = null;
            
        } else {
            this.selectedTile = tile;
            this.selectedTile.alpha = 0.5;
        }
    }

    // Tile swapping
    private swapTiles(tile1: Tile, tile2: Tile): void {
        if (this.areAdjacent(tile1, tile2)) {
            this.swapGridTiles(tile1, tile2, this.grid);
            this.animateSwap(tile1, tile2, () => {
                if (!this.checkMatches(this.grid)) {
                    this.animateSwap(tile1, tile2);
                    this.swapGridTiles(tile1, tile2, this.grid);
                }
            });
        }
    }

    private swapGridTiles(tile1: Tile, tile2: Tile, gridToSwap: Tile[][]): void {
        const tempX = tile1.gridX;
        const tempY = tile1.gridY;

        gridToSwap[tile1.gridY][tile1.gridX] = tile2;
        gridToSwap[tile2.gridY][tile2.gridX] = tile1;

        tile1.gridX = tile2.gridX;
        tile1.gridY = tile2.gridY;
        tile2.gridX = tempX;
        tile2.gridY = tempY;
    }

    private animateSwap(tile1: Tile, tile2: Tile, onComplete?: () => void): void {
        const duration = 0.5; 

        gsap.to(tile1, { x: tile2.x, y: tile2.y, duration: duration, onComplete: onComplete });
        gsap.to(tile2, { x: tile1.x, y: tile1.y, duration: duration });
    }

    private areAdjacent(tile1: Tile, tile2: Tile): boolean {
        const dx = Math.abs(tile1.gridX - tile2.gridX);
        const dy = Math.abs(tile1.gridY - tile2.gridY);

        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    private checkMatches(gridToCheck: Tile[][], testing = false): boolean {
        const matches = this.findMatches(gridToCheck)
        
        if(matches.length > 0) {
            if(!testing) {
                this.destroyMatches(matches);
            }
            return true;
        }
    
        return false;
    }

    // Check matches
    private findMatches(gridToCheck: Tile[][]): Tile[][] {
        const matches: Tile[][] = [];
        
        // Check horizontal matches
        for (let y = 0; y < this.gridSize; y++) {
            let match: Tile[] = [];
            for (let x = 0; x < this.gridSize; x++) {
                if (x > 0 && gridToCheck[y][x].tint === gridToCheck[y][x - 1].tint) {
                    match.push(this.grid[y][x]);
                } else {
                    if (match.length >= 3) matches.push([...match]);
                    match = [gridToCheck[y][x]];
                }
            }
            if (match.length >= 3) matches.push([...match]);
        }

        // Check vertical matches
        for (let x = 0; x < this.gridSize; x++) {
            let match: Tile[] = [];
            for (let y = 0; y < this.gridSize; y++) {
                if (y > 0 && gridToCheck[y][x].tint === gridToCheck[y - 1][x].tint) {
                    match.push(this.grid[y][x]);
                } else {
                    if (match.length >= 3) matches.push([...match]);
                    match = [gridToCheck[y][x]];
                }
            }
            if (match.length >= 3) matches.push([...match]);
        }

        return matches;
    }

    // Destroy matched tiles 
    private destroyMatches(matches: Tile[][]): void {
        const timeline = gsap.timeline();
        let destroyedTiles = 0 ;
        matches.forEach(match => {
            match.forEach(tile => {
                destroyedTiles++;
                timeline.to(tile, { alpha: 0, duration: 0.5, onComplete: () => {
                    sound.play('destroy');
                    this.container.removeChild(tile);
                    this.grid[tile.gridY][tile.gridX] = null;
                } }, 0);
            });
        });

        timeline.add(() => {
            this.updateScore(destroyedTiles);
            this.fillGaps();
        });
    }

    // Fill in the gaps, if any
    private fillGaps(): void {
        const timeline = gsap.timeline();

        for (let x = 0; x < this.gridSize; x++) {
            for (let y = this.gridSize - 1; y >= 0; y--) {
                if (!this.grid[y][x]) {
                    let aboveY = y - 1;
                    while (aboveY >= 0 && !this.grid[aboveY][x]) {
                        aboveY--;
                    }
                    if (aboveY >= 0) {
                        const tile = this.grid[aboveY][x];
                        this.grid[y][x] = tile;
                        this.grid[aboveY][x] = null;
                        tile.gridY = y;
                        gsap.to(tile, { y: y * this.tileSize, duration: 0.3 });
                    } else {
                        const newTile = this.createTile(x, y);
                        newTile.y = -this.tileSize;
                        this.grid[y][x] = newTile;
                        gsap.to(newTile, { y: y * this.tileSize, duration: 0.3 });
                    }
                }
            }
        }

        timeline.add(() => {
            if (!this.checkMatches(this.grid) && !this.hasPossibleMoves()) {
                this.shuffleBoard();
            }
        });
    }

    // Movability test 
    private hasPossibleMoves(): boolean {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = this.grid[y][x];
                if ((x < this.gridSize - 1 && this.isMatchPossible(tile, this.grid[y][x + 1])) ||
                    (y < this.gridSize - 1 && this.isMatchPossible(tile, this.grid[y + 1][x]))) {
  
                    return true;
                }
            }
        }
        return false;
    }

    private isMatchPossible(tile1: Tile, tile2: Tile): boolean {
        const clonedGrid = this.deepCloneGrid(this.grid);
        const clonedTile1 = clonedGrid[tile1.gridY][tile1.gridX];
        const clonedTile2 = clonedGrid[tile2.gridY][tile2.gridX];
        this.swapGridTiles(clonedTile1, clonedTile2, clonedGrid);
        const match = this.checkMatches(clonedGrid, true);
        this.swapGridTiles(clonedTile1, clonedTile2, clonedGrid);
        return match;
    }

    private deepCloneGrid(grid: Tile[][]): Tile[][] {
        return grid.map(row => row.map(tile => {
            if (tile) {
                const newTile = Object.assign(Object.create(Object.getPrototypeOf(tile)), tile);
                newTile.gridX = tile.gridX;
                newTile.gridY = tile.gridY;
                return newTile;
            }
            return null;
        }));
    }

    
    // shuffling of board elements
    private shuffleBoard(): void {
        const timeline = gsap.timeline();
        const allTiles = this.grid.flat().filter(tile => tile);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = allTiles.splice(Math.floor(Math.random() * allTiles.length), 1)[0];
                if (tile) {
                    this.grid[y][x] = tile;
                    tile.gridX = x;
                    tile.gridY = y;
                    timeline.to(tile, { x: x * this.tileSize, y: y * this.tileSize, duration: 0.5 }, 0);
                }
            }
        }

        timeline.add(() => {
            if (!this.checkMatches(this.grid) && !this.hasPossibleMoves()) {
                this.shuffleBoard();
            }
        });
    }
}

export default Grid;
