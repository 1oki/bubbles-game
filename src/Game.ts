import { Application, Sprite, Text, Texture} from "pixi.js";
import { sound } from '@pixi/sound';
import Grid from './Grid';

//  Main Game class that manages the game state and logic.
class Game {
    private app: Application;
    private bubbleTexture: Texture;
    private startButtonTexture: Texture;
    private tileSize: number;
    private gridSize: number;
    private colors: string[];
    private timeLimit: number;
    private timeLeft: number;
    private score: number;
    private timerText: Text | null;
    private scoreDisplay: Text | null;
    private timerInterval: NodeJS.Timeout | null;
    private grid: Grid | null;
    private muteEffectsButton: Text;
    private muteMusicButton: Text;
    private soundEffectsEnabled: boolean;
    private musicEnabled: boolean;
    private musicVolume: number;
    private soundEffectsVolume: number;
    

    constructor(app: Application, tileSize: number, gridSize: number, bubbleTexture: Texture, startButtonTexture: Texture) {
        this.app = app
        this.bubbleTexture = bubbleTexture;
        this.startButtonTexture = startButtonTexture;
        this.tileSize = tileSize;
        this.gridSize = gridSize;
        this.colors = ['0xFF0000', '0x00FF00', '0x0000FF', '0xFFFF00', '0xFF00FF', '0x00FFFF'];
        this.timeLimit = 60;
        this.timeLeft = this.timeLimit;
        this.score = 0;
        this.musicEnabled = false;
        this.soundEffectsEnabled = false;
        this.musicVolume = 0.3;
        this.soundEffectsVolume = 0.1;

        this.createStartButton();
        this.createMusicMuteButton();
        this.createSoundEffectMuteButton();
        this.loadSounds();
    }

    private updateScore(points: number) {
        this.score += points;
    }

    private createStartButton() {
        const startButton = new Sprite(this.startButtonTexture)

        startButton.width = this.tileSize*4;
        startButton.height = this.tileSize*4;
        startButton.x = (this.app.screen.width - startButton.width) / 2;
        startButton.y = (this.app.screen.height - startButton.height) / 2;
        startButton.eventMode = 'static';
        startButton.cursor = 'pointer';
        startButton.interactive = true;
        startButton.on('pointerdown', () => {
            this.startGame();
            this.app.stage.removeChild(startButton);
            this.app.stage.removeChild(this.scoreDisplay);
        });

        this.app.stage.addChild(startButton);
    }

    private loadSounds() {
        
        sound.add('click', '../assets/click.mp3');
        sound.add('destroy', '../assets/destroy.mp3');
        sound.add('music', '../assets/music.mp3');
        sound.volume('click', this.soundEffectsEnabled ? this.soundEffectsVolume : 0);
        sound.volume('destroy', this.soundEffectsEnabled ? this.soundEffectsVolume : 0);
        sound.volume('music',  this.musicVolume);
        this.musicEnabled ? sound.play('music',{ loop: true }) : '';
    }

    private createMusicMuteButton() {
        const music = new Text({
            text: `Music`,
            style: {
                fontFamily: 'Arial',
                fontSize: this.app.screen.width < 380 ? 16 : 24,
                fill: 0xffffff,
                align: 'center'
            }
            
        });
        music.x = 10;
        music.y = 10;

        this.app.stage.addChild(music);

        this.muteMusicButton = new Text({
            text: this.musicEnabled ? "On" : "Off",
            style: {
                fontFamily: 'Arial',
                fontSize: this.app.screen.width < 380 ? 16 : 24,
                fill: this.musicEnabled ? "0x00FF00" : "0xFF0000",
                align: 'center',
            }           
        });
        this.muteMusicButton.x = this.app.screen.width < 380 ? 60 : 80;
        this.muteMusicButton.y = 10;
        this.muteMusicButton.interactive = true;
        this.muteMusicButton.cursor = 'pointer';
        this.muteMusicButton.on('pointerdown', () => this.toggleMusic());

        this.app.stage.addChild(this.muteMusicButton);
    }

    private createSoundEffectMuteButton() {
        const soundEffects = new Text({
            text: `Sound effects`,
            style: {
                fontFamily: 'Arial',
                fontSize: this.app.screen.width < 380 ? 16 : 24,
                fill: 0xffffff,
                align: 'center'
            }
            
        });
        soundEffects.x = 150;
        soundEffects.y = 10;
        soundEffects.x = this.app.screen.width < 380 ? 10 : 150;
        soundEffects.y = this.app.screen.width < 380 ? 30 : 10;

        this.app.stage.addChild(soundEffects);

        this.muteEffectsButton = new Text({
            text: this.soundEffectsEnabled ? "On" : "Off",
            style: {
                fontFamily: 'Arial',
                fontSize: this.app.screen.width < 380 ? 16 : 24,
                fill: this.soundEffectsEnabled ? "0x00FF00" : "0xFF0000",
                align: 'center',
            }           
        });
        this.muteEffectsButton.x = this.app.screen.width < 380 ? 115 : 303;
        this.muteEffectsButton.y = this.app.screen.width < 380 ? 30 : 10;
        this.muteEffectsButton.interactive = true;
        this.muteEffectsButton.cursor = 'pointer';
        this.muteEffectsButton.on('pointerdown', () => this.toggleSoundEffects());

        this.app.stage.addChild(this.muteEffectsButton);
    }

    private toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if(this.musicEnabled) {
            sound.play('music',{ loop: true, volume: this.musicVolume });
        } else {
            sound.stop('music');
        }

        this.muteMusicButton.text = this.musicEnabled ? "On" : "Off";
        this.muteMusicButton.style.fill = this.musicEnabled ? "0x00FF00" : "0xFF0000";
    }

    private toggleSoundEffects() {
        this.soundEffectsEnabled = !this.soundEffectsEnabled;

        sound.volume('click', this.soundEffectsEnabled ? this.soundEffectsVolume : 0);
        sound.volume('destroy', this.soundEffectsEnabled ? this.soundEffectsVolume : 0);

        this.muteEffectsButton.text = this.soundEffectsEnabled ? "On" : "Off";
        this.muteEffectsButton.style.fill = this.soundEffectsEnabled ? "0x00FF00" : "0xFF0000";
    }

    private createTimer() {
        this.timerText = new Text({
            text: this.app.screen.width < 380 ? `Time remaining: \n${this.timeLeft} seconds` : `Time remaining: ${this.timeLeft} seconds`,
            style: {
                fontFamily: 'Arial',
                fontSize: this.app.screen.width < 380 ? 16 : 24,
                fill: 0xffffff,
                align: 'center'
            }
        });

        this.timerText.x = this.app.screen.width < 380 ? 10 : this.app.screen.width - 320;
        this.timerText.y = this.app.screen.width < 680 ? this.app.screen.width < 380 ? this.app.screen.height - 45: this.app.screen.height - 30 : 10;

        this.app.stage.addChild(this.timerText);
    }

    private startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerText.text = this.app.screen.width < 380 ? `Time remaining: \n${this.timeLeft} seconds` : `Time remaining: ${this.timeLeft} seconds`;

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    private startGame() {
        this.score = 0;
        this.timeLeft = this.timeLimit;

        this.createTimer();
        this.startTimer();
            
        this.grid = new Grid(this.gridSize, this.tileSize, this.colors, this.bubbleTexture, this.app, this.updateScore.bind(this));
        this.grid.createGrid();


    }

    private endGame() {
        this.app.stage.removeChild(this.grid.container);
        this.app.stage.removeChild(this.timerText);
        
        this.showScore();
        this.createStartButton();
    }

    private showScore() {
        this.scoreDisplay = new Text({
            text:`Game Over! Time\'s up! \n In ${this.timeLimit} seconds \n you've scored ${this.score} points `, 
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
        });
        this.scoreDisplay.x = (this.app.screen.width - this.scoreDisplay.width) / 2;
        this.scoreDisplay.y = this.app.screen.height - 90;

        this.app.stage.addChild(this.scoreDisplay);
    }

}

export default Game;
