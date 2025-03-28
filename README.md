# Bubbles (Match-3) Game
This project is a Match-3 Puzzle Game built with PixiJS, GSAP. Howler and TypeScript. Players swap adjacent tiles to create groups of 3 or more matching tiles, which are then destroyed to gain points. The game includes sound effects and background music, each with independent mute/unmute controls.

## Features
- Match-3 Mechanics: Swap adjacent tiles to form groups of three or more.
- Score System: Earn points for each tile destroyed.
- Timer: The game is time-bound, with a countdown timer.
- Sound Effects: Enjoy click and destruction sound effects with mute control.
- Background Music: Background music plays independently, with a separate mute control.

## Table of Contents
- Installation
- Gameplay
- Controls
- Development
- License

## Installation
1. **Clone the repository**:

   ```bash
   git clone https://github.com/1oki/bubbles-game.git
   cd bubbles-game
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```
3. **Install Additional Packages**:

   This game uses @pixi/sound for sound effects and background music. Install it if not included in your package.json:

   ```bash
   npm install @pixi/sound
   ```
4. **Build the Project**:

   ```bash
   npm run start
   ```
5. **Run the Game**:

   Start the live server to start the game.

## Gameplay
1. Objective: Score as many points as possible before the timer runs out by creating tile matches.
2. Matches: Form horizontal or vertical lines of 3 or more tiles of the same color to destroy them.
3. Scoring: Each destroyed tile earns points, contributing to your final score.
   
## Win Condition
The game ends when the timer reaches zero. Your score is then displayed on the screen.

## Controls
- Start Game: Click the Start button.
- Mute/Unmute Sounds: Toggle sound effects (click and destroy) by clicking Mute Sounds.
- Mute/Unmute Music: Toggle background music by clicking Mute Music.
- Swap Tiles: Click two adjacent tiles to swap their positions.
  
## Development
### File Structure
- src/: Contains TypeScript source code for the game.
  - Game.ts: Main game logic, including UI and controls.
  - Grid.ts: Manages the tile grid and matching logic.
  - Tile.ts: Represents individual tiles in the game.
- assets/: Holds images, textures, and sounds used in the game.

## Customization
Add new sounds by placing files in "assets" folder and updating the paths in Game.ts.
Adjust grid size in index.ts to change gameplay dimensions.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
