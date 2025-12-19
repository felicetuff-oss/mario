import Entity from './Entity.js';
import Item from './Item.js';
import { PLAYER_STATES } from './PlayerData.js';
import { Killable } from './Traits.js';

export default class Flower extends Entity {
    constructor() {
        super();
        this.addTrait(new Item());
        this.addTrait(new Killable());
        this.killable.removeAfter = 0;
        this.size.set(16, 16);

        this.spawning = false;
        this.spawnTime = 0;
        this.spawnDuration = 1.0;
        this.targetY = 0;
    }

    spawn(x, y) {
        this.pos.set(x, y);
        this.spawnBlockY = y;
        this.targetY = y - 16;
        this.spawning = true;
        this.spawnTime = 0;
        this.item.enabled = false;
    }

    collect(mario) {
        if (this.item) {
            this.item.enabled = false;
        }
        const nextState = mario.state === PLAYER_STATES.SMALL
            ? PLAYER_STATES.BIG
            : PLAYER_STATES.FIRE;
        if (mario.setState) {
            mario.setState(nextState);
        } else {
            mario.state = nextState;
            if (mario.player) {
                mario.player.state = nextState;
            }
        }
        if (mario.player) {
            mario.player.addScore(1000);
        }
        this.killable.kill();
    }

    update(deltaTime, level) {
        if (this.spawning) {
            this.spawnTime += deltaTime;
            if (this.pos.y > this.targetY) {
                this.pos.y -= 20 * deltaTime;
            } else {
                this.pos.y = this.targetY;
                this.spawning = false;
                this.item.enabled = true;
            }
            return;
        }
        super.update(deltaTime, level);
    }

    render(context) {
        if (this.spawning && typeof this.spawnBlockY === 'number') {
            const clipH = Math.min(this.size.y, Math.max(0, this.spawnBlockY - this.pos.y));
            context.save();
            context.beginPath();
            context.rect(0, 0, this.size.x, clipH);
            context.clip();
            context.fillStyle = '#ff4fd8'; // Bright petals for visibility
            context.fillRect(2, 2, 12, 12);
            context.fillStyle = '#00cc66'; // Stalk
            context.fillRect(6, 14, 4, 2);
            context.fillStyle = '#ffee33'; // Center highlight
            context.fillRect(6, 6, 4, 4);
            context.restore();
            return;
        }

        context.fillStyle = '#ff4fd8'; // Bright petals for visibility
        context.fillRect(2, 2, 12, 12);
        context.fillStyle = '#00cc66'; // Stalk
        context.fillRect(6, 14, 4, 2);
        context.fillStyle = '#ffee33'; // Center highlight
        context.fillRect(6, 6, 4, 4);
    }
}
