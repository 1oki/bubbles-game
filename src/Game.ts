import { Application, Sprite, Text, Texture} from "pixi.js";
import { sound } from '@pixi/sound';
import Grid from './Grid';

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
    
    constructor(app: Application, bubbleTexture: Texture, startButtonTexture: Texture) {
        this.app = app
        this.bubbleTexture = bubbleTexture;
        this.startButtonTexture = startButtonTexture;
        this.tileSize = 50;
        this.gridSize = 7;
        this.colors = ['0xFF0000', '0x00FF00', '0x0000FF', '0xFFFF00', '0xFF00FF', '0x00FFFF'];
        this.timeLimit = 60;
        this.timeLeft = this.timeLimit;
        this.score = 0;
        this.musicEnabled = true;

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
        this.soundEffectsEnabled = true;

        sound.add('click', '../assets/click.mp3');
        sound.add('destroy', '../assets/destroy.mp3');
        sound.add('music', '../assets/music.mp3');
        sound.play('music',{ loop: true });
    }

    private createMusicMuteButton() {
        const music = new Text({
            text: `Music`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
            
        });
        music.x = 10;
        music.y = 10;

        this.app.stage.addChild(music);

        this.muteMusicButton = new Text({
            text: `On`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x00ff00,
                align: 'center',
            }           
        });
        this.muteMusicButton.x = 80;
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
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
            
        });
        soundEffects.x = 150;
        soundEffects.y = 10;

        this.app.stage.addChild(soundEffects);

        this.muteEffectsButton = new Text({
            text: `On`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x00ff00,
                align: 'center',
            }           
        });
        this.muteEffectsButton.x = 300;
        this.muteEffectsButton.y = 10;
        this.muteEffectsButton.interactive = true;
        this.muteEffectsButton.cursor = 'pointer';
        this.muteEffectsButton.on('pointerdown', () => this.toggleSoundEffects());

        this.app.stage.addChild(this.muteEffectsButton);
    }

    private toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if(this.musicEnabled) {
            sound.play('music',{ loop: true });
        } else {
            sound.stop('music');
        }

        this.muteMusicButton.text = this.musicEnabled ? "On" : "Off";
        this.muteMusicButton.style.fill = this.musicEnabled ? "0x00FF00" : "0xFF0000";
    }

    private toggleSoundEffects() {
        this.soundEffectsEnabled = !this.soundEffectsEnabled;

        sound.volume('click', this.soundEffectsEnabled ? 1 : 0);
        sound.volume('destroy', this.soundEffectsEnabled ? 1 : 0);

        this.muteEffectsButton.text = this.soundEffectsEnabled ? "On" : "Off";
        this.muteEffectsButton.style.fill = this.soundEffectsEnabled ? "0x00FF00" : "0xFF0000";
    }

    private createTimer() {
        this.timerText = new Text({
            text: `Time remaining: ${this.timeLeft} seconds`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
        });

        this.timerText.x = this.app.screen.width - 320;
        this.timerText.y = 10;

        this.app.stage.addChild(this.timerText);
    }

    private startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerText.text = `Time remaining: ${this.timeLeft} seconds`;

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
            text:`Game Over! Time\'s up! \n In ${this.timeLimit} seconds you've scored ${this.score} points `, 
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
        });
        this.scoreDisplay.x = (this.app.screen.width - this.scoreDisplay.width) / 2;
        this.scoreDisplay.y = (this.app.screen.height - this.scoreDisplay.height) / 4;

        this.app.stage.addChild(this.scoreDisplay);
    }

}

export default Game;
