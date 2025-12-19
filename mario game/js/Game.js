import GameState, { States } from './GameState.js';
import Loader from './Loader.js';
import Camera from './Camera.js';
import InputHandler from './InputHandler.js';
import SpriteSheet from './SpriteSheet.js';
import LevelLoader from './LevelLoader.js';
import Player, { PLAYER_STATES } from './PlayerData.js';
import Dashboard from './Dashboard.js';
import Mario from './Mario.js';
import Goomba from './Goomba.js';
import Koopa from './Koopa.js';
import Coin from './Coin.js';
import Mushroom from './Mushroom.js';
import Flower from './Flower.js';
import Flag from './Flag.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        // NES Resolution but scaled
        this.viewWidth = 256;
        this.viewHeight = 240;

        this.loader = new Loader();
        this.levelLoader = new LevelLoader(this.loader);
        this.state = new GameState();
        this.camera = new Camera();
        this.input = new InputHandler();
        this.player = new Player();
        this.dashboard = new Dashboard();

        this.level = null;
        this.mario = null;

        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.deltaTime = 1 / 60;
    }

    async init() {
        this.state.set(States.LOADING);

        await this.loadAssets();
        await this.setupLevel();
        this.setupInputs();

        this.state.set(States.PLAYING);
        this.startLoop();
    }

    async loadAssets() {
        await Promise.all([
            this.loader.loadImage('background', 'mario_picture/background.png'),
            this.loader.loadImage('mario', 'mario_picture/mario_bros.png'),
            this.loader.loadImage('tiles', 'mario_picture/brick.png'),
            this.loader.loadImage('items', 'mario_picture/item_objects.png'),
            this.loader.loadImage('enemies', 'mario_picture/enemies.png')
        ]);
        console.log("Assets loaded!");
    }

    async setupLevel() {
        const marioSprites = new SpriteSheet(this.loader.getImage('mario'), 16, 16);
        marioSprites.define('idle', 0, 8, 16, 16);
        marioSprites.define('run-1', 16, 8, 16, 16);
        marioSprites.define('run-2', 32, 8, 16, 16);
        marioSprites.define('run-3', 48, 8, 16, 16);
        marioSprites.define('jump', 80, 8, 16, 16);
        marioSprites.define('brake', 64, 8, 16, 16);

        const tileSprites = new SpriteSheet(this.loader.getImage('tiles'), 16, 16);
        tileSprites.defineTile('ground', 0, 0);
        tileSprites.defineTile('brick', 1, 0);
        tileSprites.defineTile('question-block', 3, 0);
        tileSprites.defineTile('empty-block', 3, 1);

        tileSprites.defineTile('pipe-top-left', 0, 8);
        tileSprites.defineTile('pipe-top-right', 1, 8);
        tileSprites.defineTile('pipe-side-left', 0, 9);
        tileSprites.defineTile('pipe-side-right', 1, 9);

        tileSprites.defineTile('cloud-top-left', 0, 20);
        tileSprites.defineTile('cloud-top-mid', 1, 20);
        tileSprites.defineTile('cloud-top-right', 2, 20);
        tileSprites.defineTile('cloud-bot-left', 0, 21);
        tileSprites.defineTile('cloud-bot-mid', 1, 21);
        tileSprites.defineTile('cloud-bot-right', 2, 21);

        const enemySprites = new SpriteSheet(this.loader.getImage('enemies'), 16, 16);
        enemySprites.define('goomba-1', 94, 0, 16, 16);
        enemySprites.define('goomba-2', 110, 0, 16, 16);
        enemySprites.define('goomba-dead', 126, 0, 16, 16);

        enemySprites.define('koopa-1', 142, 0, 16, 24);
        enemySprites.define('koopa-2', 158, 0, 16, 24);
        enemySprites.define('koopa-shell', 174, 0, 16, 16);
        enemySprites.define('koopa-dead', 190, 0, 16, 16);

        const itemSprites = new SpriteSheet(this.loader.getImage('items'), 16, 16);
        itemSprites.define('mushroom', 0, 0, 16, 16);
        itemSprites.define('coin', 0, 80, 16, 16);

        const entityFactory = {
            'goomba': () => new Goomba(enemySprites),
            'koopa': () => new Koopa(enemySprites),
            'flag': () => {
                const flag = new Flag();
                flag.onTouch = (mario) => this.triggerLevelComplete(mario);
                return flag;
            }
        };

        const itemFactory = {
            'mushroom': () => new Mushroom(itemSprites),
            'coin': () => new Coin(itemSprites),
            'flower': () => new Flower(),
            'powerup': (entity) => {
                let state = PLAYER_STATES.SMALL;
                if (entity) {
                    state = entity.state;
                }
                if (state === PLAYER_STATES.BIG || state === PLAYER_STATES.FIRE) {
                    return new Flower();
                }
                return new Mushroom(itemSprites);
            }
        };

        this.level = await this.levelLoader.load('level-1-1', entityFactory, itemFactory);
        this.level.tileSprites = tileSprites;

        this.mario = new Mario(marioSprites);
        this.mario.player = this.player; // Link player data
        this.mario.pos.set(64, 128);
        this.level.entities.add(this.mario);
    }

    setupInputs() {
        this.input.addMapping('ArrowRight', keyState => {
            if (this.mario && this.mario.go) this.mario.go.dir += keyState ? 1 : -1;
        });
        this.input.addMapping('KeyD', keyState => {
            if (this.mario && this.mario.go) this.mario.go.dir += keyState ? 1 : -1;
        });
        this.input.addMapping('ArrowLeft', keyState => {
            if (this.mario && this.mario.go) this.mario.go.dir += keyState ? -1 : 1;
        });
        this.input.addMapping('KeyA', keyState => {
            if (this.mario && this.mario.go) this.mario.go.dir += keyState ? -1 : 1;
        });

        this.input.addMapping('KeyK', keyState => {
            if (!this.mario || !this.mario.jump) return;
            if (keyState) this.mario.jump.start();
            else this.mario.jump.cancel();
        });

        this.input.addMapping('KeyJ', keyState => {
            if (this.mario && keyState) {
                this.mario.shoot(this.level);
            }
        });

        this.input.listenTo(window);
    }

    startLoop() {
        const loop = (time) => {
            try {
                this.accumulatedTime += (time - this.lastTime) / 1000;

                while (this.accumulatedTime > this.deltaTime) {
                    this.update(this.deltaTime);
                    this.accumulatedTime -= this.deltaTime;
                }

                this.draw();
            } catch (e) {
                console.error("Game Loop Error:", e);
            }

            this.lastTime = time;
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    update(deltaTime) {
        if (this.state.get() !== States.PLAYING) return;

        if (this.level) {
            this.level.update(deltaTime, this.camera);
        }
        if (this.player) {
            this.player.update(deltaTime);
        }
        if (this.dashboard) {
            this.dashboard.update(deltaTime, this.player);
        }

        // Camera follow
        if (this.mario) {
            this.camera.pos.x = Math.max(0, this.mario.pos.x - 100);
        }
        // Clamp camera (example width, adjust if needed)
        this.camera.pos.x = Math.min(this.camera.pos.x, 3392 - 256);
    }

    draw() {
        this.context.fillStyle = '#6b8cff'; // Sky blue
        this.context.fillRect(0, 0, this.viewWidth, this.viewHeight);

        if (this.state.get() === States.LOADING) {
            this.drawLoadingScreen();
            return;
        }

        if (this.level) {
            this.level.draw(this.context, this.camera);
        }

        if (this.dashboard) {
            this.dashboard.draw(this.context);
        }
    }

    triggerLevelComplete(mario) {
        console.log("Level Complete!");

        // 1. Remove user control trait (Go) or override input
        this.input.actions.clear(); // Disable all inputs

        // 2. Animate Slide Down
        mario.vel.set(0, 50);
        mario.physics.enabled = false; // Disable normal physics to control slide

        const groundY = 13 * 16 - mario.size.y; // Ground level

        const animate = (time) => {
            if (mario.pos.y < groundY) {
                mario.pos.y += 2; // Slide speed
                requestAnimationFrame(animate);
            } else {
                // Done sliding, walk right
                mario.pos.y = groundY;
                mario.physics.enabled = true; // Re-enable physics for walking
                mario.go.dir = 1; // Walk right
                mario.go.acceleration = 100; // Slow walk

                setTimeout(() => {
                    // Level End
                    alert("Level Complete!");
                    location.reload();
                }, 2000);
            }
        };
        requestAnimationFrame(animate);
    }



    drawLoadingScreen() {
        const ctx = this.context;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`LOADING... ${Math.round(this.loader.progress * 100)}%`, this.viewWidth / 2, this.viewHeight / 2);
    }
}
