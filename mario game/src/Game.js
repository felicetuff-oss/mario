import Level from './Level.js';
import { loadAssets } from './Assets.js';
import Input from './Input.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.lastTime = 0;
        this.input = new Input();
    }

    async start() {
        console.log('Loading assets...');
        await loadAssets();
        console.log('Assets loaded');

        this.level = new Level();
        await this.level.load();

        this.loop(0);
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        if (this.level) {
            this.level.update(deltaTime);

            const mario = this.level.mario;
            if (mario) {
                if (this.input.isDown('ArrowRight')) {
                    mario.go.dir = 1;
                } else if (this.input.isDown('ArrowLeft')) {
                    mario.go.dir = -1;
                } else {
                    mario.go.dir = 0;
                }

                if (this.input.isDown('Space')) {
                    mario.jump.start();
                } else {
                    mario.jump.cancel();
                }
            }
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.level) {
            this.level.draw(this.context);
        }
    }
}
