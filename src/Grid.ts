import { Application, Container, FederatedPointerEvent, Texture } from "pixi.js";
import { sound } from '@pixi/sound';
import gsap from 'gsap';
import Tile from './Tile';

//  Manages the grid structure of the game. Handles placement, removal, and movement of bubbles.
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

    // Variables for swipe detection
    private startX: number = 0;
    private startY: number = 0;
    private isSwiping: boolean = false;
    private swipeThreshold: number = 30; // Minimum distance to be considered a swipe

    constructor(gridSize: number, tileSize: number, colors: string[], texture:Texture, app:Application, updateScore:(points:number) => void) {
        this.gridSize = gridSize;   //  The size of the grid/
        this.tileSize = tileSize;   //  The size of each tile in the grid.
        this.colors = colors;       //  The colors of the tiles.
        this.texture = texture;     //  The texture of the tiles.
        this.app = app;             //  The application instance.
        this.container = new Container();   //The container for the grid.
        this.container.x = (this.app.screen.width - this.tileSize*this.gridSize) / 2;      //  The x-coordinate of the container.
        this.container.y = (this.app.screen.height - this.tileSize*this.gridSize) / 2;    //  The y-coordinate of the container.
        this.grid = [];             //  The grid itself.
        this.selectedTile = null;   //  The currently selected tile.
        this.updateScore = updateScore;         //  The callback function that updates the score.
        this.container.eventMode = 'static';    //  The event mode of the container.
        this.container.cursor = 'pointer';      //  The cursor of the container.

        app.stage.addChild(this.container); //  Add the container to the application stage.

        // Event listeners for both clicks and swipes
        this.container.on('pointerdown', this.onPointerDown.bind(this));
        this.container.on('pointermove', this.onPointerMove.bind(this));
        this.container.on('pointerup', this.onPointerUp.bind(this));
    }

    //  Creates a new grid with the specified size.
    public createGrid(): void {
        this.grid = [];
        // Fill grid with tiles
        for (let y = 0; y < this.gridSize; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < this.gridSize; x++) {
                const tile = this.createTile(x, y);
                row.push(tile);
            }
            this.grid.push(row);
        }
        // Check the grid for matches
        this.checkMatches(this.grid);
        // If there are no possible moves, shuffle the board
        if (!this.hasPossibleMoves()) {
            this.shuffleBoard();
        }
    }

    //  Creates a new tile at the specified grid position with a random color.
    private createTile(x: number, y: number): Tile {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const tile = new Tile(this.texture, x, y, this.tileSize, color);
        this.container.addChild(tile);
        return tile;
    }

    // Handles the pointerdown event (click or swipe start) on a tile by either selecting or swapping with the currently selected tile.
    private onPointerDown(event: FederatedPointerEvent): void {
        sound.play('click');
        const tile = event.target as Tile;
        if (this.selectedTile) {
            // If there is already a selected tile, swap it with the clicked tile
            this.selectedTile.alpha = 1;
            this.swapTiles(this.selectedTile, tile);
            this.selectedTile = null;
            return;
        }
        if (tile) {
            this.startX = event.globalX;
            this.startY = event.globalY;
            this.selectedTile = tile;
            this.selectedTile.alpha = 0.5;
            this.isSwiping = false; // Reset swipe detection
        }
    }

    // Handle pointer move (detect swipes)
    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.selectedTile) return;

        const diffX = event.globalX - this.startX;
        const diffY = event.globalY - this.startY;

        if (Math.abs(diffX) > this.swipeThreshold || Math.abs(diffY) > this.swipeThreshold) {
            this.isSwiping = true; // Mark as swiping to prevent click selection
        }
    }

    // Handle pointer up (detect if it's a swipe or a click)
    private onPointerUp(event: FederatedPointerEvent): void {
        if (!this.selectedTile) return;

        const endX = event.globalX;
        const endY = event.globalY;
        const diffX = endX - this.startX;
        const diffY = endY - this.startY;

        if (this.isSwiping) {
            // Determine swipe direction
            let direction: "left" | "right" | "up" | "down" | null = null;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > this.swipeThreshold) direction = "right";
                else if (diffX < -this.swipeThreshold) direction = "left";
            } else {
                if (diffY > this.swipeThreshold) direction = "down";
                else if (diffY < -this.swipeThreshold) direction = "up";
            }

            if (direction) {
                this.handleSwipe(this.selectedTile, direction);
            }
        } else {
            // If no significant movement, treat as a click
            return;
        }
        
        this.selectedTile.alpha = 1;
        this.selectedTile = null;
    }

    private handleSwipe(tile: Tile, direction: "left" | "right" | "up" | "down"): void {
        let targetTile: Tile | null = null;
        sound.play('click');

        switch (direction) {
            case "left":
                if (tile.gridX > 0) targetTile = this.grid[tile.gridY][tile.gridX - 1];
                break;
            case "right":
                if (tile.gridX < this.gridSize - 1) targetTile = this.grid[tile.gridY][tile.gridX + 1];
                break;
            case "up":
                if (tile.gridY > 0) targetTile = this.grid[tile.gridY - 1][tile.gridX];
                break;
            case "down":
                if (tile.gridY < this.gridSize - 1) targetTile = this.grid[tile.gridY + 1][tile.gridX];
                break;
        }

        if (targetTile) {
            this.swapTiles(tile, targetTile);
        }
    }

    //  Swaps two adjacent tiles and checks for matches. If no matches are found, the swap is reverted.
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

    //  Swaps two tiles in a grid.
    private swapGridTiles(tile1: Tile, tile2: Tile, gridToSwap: Tile[][]): void {
        // Store the position of tile1 in temporary variables
        const tempX = tile1.gridX;
        const tempY = tile1.gridY;

        // Swap the tiles in the grid
        gridToSwap[tile1.gridY][tile1.gridX] = tile2;
        gridToSwap[tile2.gridY][tile2.gridX] = tile1;

        // Update the grid positions of the tiles
        tile1.gridX = tile2.gridX;
        tile1.gridY = tile2.gridY;
        tile2.gridX = tempX;
        tile2.gridY = tempY;
    }

    //  Animates the swap of two tiles by moving them to each other's positions. The onComplete callback is optional and can be used to perform additional actions after the animation is complete.
    private animateSwap(tile1: Tile, tile2: Tile, onComplete?: () => void): void {
        const duration = 0.5;                                                   // The duration of the animation in seconds.
        gsap.to(tile1, { x: tile2.x, y: tile2.y, duration: duration, onComplete: onComplete }); // Animate the swap by moving each tile to the other's position.
        gsap.to(tile2, { x: tile1.x, y: tile1.y, duration: duration });
    }

    //  Checks if two tiles are adjacent.Two tiles are considered adjacent if they are either horizontally or vertically adjacent.
    private areAdjacent(tile1: Tile, tile2: Tile): boolean {
        // Calculate the absolute difference in x and y coordinates between the two tiles
        const dx = Math.abs(tile1.gridX - tile2.gridX);
        const dy = Math.abs(tile1.gridY - tile2.gridY);
        // This is the case if the absolute difference in x coordinates is 1 and the absolute difference in y coordinates is 0
        // or if the absolute difference in x coordinates is 0 and the absolute difference in y coordinates is 1
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    //  Checks if there are any matches in the grid.A match is defined as a set of three or more tiles of the same color that are either horizontally or vertically adjacent.
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

    //  Checks the grid for any matches and returns an array of Tile arrays, where each Tile array is a match of three or more tiles of the same color that are either horizontally or vertically adjacent.
    private findMatches(gridToCheck: Tile[][]): Tile[][] {
        const matches: Tile[][] = [];
        
        // Check horizontal matches
        for (let y = 0; y < this.gridSize; y++) {
            let match: Tile[] = [];
            for (let x = 0; x < this.gridSize; x++) {
                // If the current tile is the same color as the previous tile, add it to the match array
                if (x > 0 && gridToCheck[y][x].tint === gridToCheck[y][x - 1].tint) {
                    match.push(this.grid[y][x]);
                } else {
                    // If the match array has at least three elements, add it to the matches array
                    if (match.length >= 3) matches.push([...match]);
                    // Reset the match array
                    match = [gridToCheck[y][x]];
                }
            }
            // Check if the last match array has at least three elements and add it to the matches array
            if (match.length >= 3) matches.push([...match]);
        }

        // Check vertical matches
        for (let x = 0; x < this.gridSize; x++) {
            let match: Tile[] = [];
            for (let y = 0; y < this.gridSize; y++) {
                // If the current tile is the same color as the tile above it, add it to the match array
                if (y > 0 && gridToCheck[y][x].tint === gridToCheck[y - 1][x].tint) {
                    match.push(this.grid[y][x]);
                } else {
                    // If the match array has at least three elements, add it to the matches array
                    if (match.length >= 3) matches.push([...match]);
                    // Reset the match array
                    match = [gridToCheck[y][x]];
                }
            }
            // Check if the last match array has at least three elements and add it to the matches array
            if (match.length >= 3) matches.push([...match]);
        }

        return matches;
    }

    //  Destroy matched tiles
    private destroyMatches(matches: Tile[][]): void {
        const timeline = gsap.timeline();
        let destroyedTiles = 0 ;
        matches.forEach(match => {
            match.forEach(tile => {
                destroyedTiles++;
                timeline.to(tile, { alpha: 0, duration: 0.5, onComplete: () => {
                    // Play the destroy sound effect
                    sound.play('destroy');
                    // Remove the tile from the container
                    this.container.removeChild(tile);
                    // Set the tile in the grid to null
                    this.grid[tile.gridY][tile.gridX] = null;
                } }, 0);
            });
        });

        timeline.add(() => {
            // Update the score
            this.updateScore(destroyedTiles);
            // Fill in the gaps, if any
            this.fillGaps();
        });
    }

    //  Fill in the gaps in the grid with tiles from above or with new tiles. If there are no matches and no possible moves, shuffle the board.
    private fillGaps(): void {
        const timeline = gsap.timeline();

        for (let x = 0; x < this.gridSize; x++) {
            for (let y = this.gridSize - 1; y >= 0; y--) {
                // If there is a gap in the grid, fill it in with a tile from above or with a new tile
                if (!this.grid[y][x]) {
                    let aboveY = y - 1;
                    while (aboveY >= 0 && !this.grid[aboveY][x]) {
                        aboveY--;
                    }
                    if (aboveY >= 0) {
                        // Move the tile above the gap to the gap
                        const tile = this.grid[aboveY][x];
                        this.grid[y][x] = tile;
                        this.grid[aboveY][x] = null;
                        tile.gridY = y;
                        // Animate the tile moving to the gap
                        gsap.to(tile, { y: y * this.tileSize, duration: 0.3 });
                    } else {
                        // Create a new tile to fill the gap
                        const newTile = this.createTile(x, y);
                        newTile.y = -this.tileSize;
                        this.grid[y][x] = newTile;
                        // Animate the tile moving to the gap
                        gsap.to(newTile, { y: y * this.tileSize, duration: 0.3 });
                    }
                }
            }
        }

        timeline.add(() => {
            // If there are no matches and no possible moves, shuffle the board
            if (!this.checkMatches(this.grid) && !this.hasPossibleMoves()) {
                this.shuffleBoard();
            }
        });
    }

    //  Checks if there are any possible moves in the grid. A possible move is when a tile can be swapped with one of its adjacent tiles to create a match.
    private hasPossibleMoves(): boolean {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = this.grid[y][x];
                // Check if the tile can be swapped with its right or bottom neighbor to create a match
                if ((x < this.gridSize - 1 && this.isMatchPossible(tile, this.grid[y][x + 1])) ||
                    (y < this.gridSize - 1 && this.isMatchPossible(tile, this.grid[y + 1][x]))) {
                    return true;
                }
            }
        }
        return false;
    }

    //  Determines if swapping two tiles will result in a match. This function creates a deep clone of the grid, performs the swap on the clone, and checks for matches, ensuring the original grid remains unchanged.
    private isMatchPossible(tile1: Tile, tile2: Tile): boolean {
        const clonedGrid = this.deepCloneGrid(this.grid); 
        const clonedTile1 = clonedGrid[tile1.gridY][tile1.gridX]; 
        const clonedTile2 = clonedGrid[tile2.gridY][tile2.gridX]; 
        this.swapGridTiles(clonedTile1, clonedTile2, clonedGrid); 
        const match = this.checkMatches(clonedGrid, true); 
        this.swapGridTiles(clonedTile1, clonedTile2, clonedGrid); 
        return match; 
    }

    //  Creates a deep clone of the grid. This function creates a new instance of each tile in the grid and copies over its properties, while preserving the prototype chain. It is used to clone the grid when checking for potential matches, so that the original grid remains unchanged.
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

    //  Shuffles the board by randomly repositioning all tiles, making sure that all tiles are in a valid position. If after shuffling the board, there are no possible moves and no matches, the board is shuffled again.
    private shuffleBoard(): void {
        const timeline = gsap.timeline();
        const allTiles = this.grid.flat().filter(tile => tile);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tile = allTiles.splice(Math.floor(Math.random() * allTiles.length), 1)[0];
                if (tile) {
                    // Set the new position of the tile
                    this.grid[y][x] = tile;
                    tile.gridX = x;
                    tile.gridY = y;

                    // Animate the tile to its new position
                    timeline.to(tile, { x: x * this.tileSize, y: y * this.tileSize, duration: 0.5 }, 0);
                }
            }
        }

        timeline.add(() => {
            // Check if there are any matches after shuffling the board
            if (!this.checkMatches(this.grid) && !this.hasPossibleMoves()) {
                // If not, shuffle the board again
                this.shuffleBoard();
            }
        });
    }
}

export default Grid;
