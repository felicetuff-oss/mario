import Entity from './Entity.js';
import Item from './Item.js';
import { Physics, Solid, PendulumMove, Killable } from './Traits.js';
import { PLAYER_STATES } from './PlayerData.js';

export default class Mushroom extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.addTrait(new Physics());
        this.addTrait(new Solid());
        this.addTrait(new PendulumMove());
        this.addTrait(new Item());
        this.addTrait(new Killable());
        this.killable.removeAfter = 0;

        this.pendulumMove.speed = 100;
        this.vel.set(0, 0); // Start stationary? Or depends on state

        this.spawning = true;
        this.spawnTime = 0;
        this.spawnDuration = 1.0; // 1 second to rise
        this.targetY = 0;
    }

    // Called by TileTrait when creating the item
    // We want to spawn effectively "inside" the block then rise
    spawn(x, y) {
        this.pos.set(x, y);
        this.spawnBlockY = y;
        this.targetY = y - 16;
        this.spawning = true;
        this.spawnTime = 0;
        // Disable regular physics traits while spawning
        this.physics.enabled = false;
        this.solid.enabled = false;
        this.pendulumMove.enabled = false;
        this.item.enabled = false;
    }

    update(deltaTime, level) {
        if (this.spawning) {
            this.spawnTime += deltaTime;
            if (this.pos.y > this.targetY) {
                this.pos.y -= 20 * deltaTime; // Rise speed
            } else {
                this.pos.y = this.targetY;
                this.spawning = false;
                this.physics.enabled = true;
                this.solid.enabled = true;
                this.pendulumMove.enabled = true;
                this.item.enabled = true;
                this.vel.y = 0; // Reset velocity
            }
            return;
        }
        super.update(deltaTime, level);
    }

    collect(mario) {
        if (this.item) {
            this.item.enabled = false;
        }
        let nextState = PLAYER_STATES.BIG;
        if (mario.state === PLAYER_STATES.BIG) {
            nextState = PLAYER_STATES.FIRE;
        }
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

    kill() {
        // Implementation for removing from level
    }

    render(context) {
        if (this.spawning && typeof this.spawnBlockY === 'number') {
            const clipH = Math.min(this.size.y, Math.max(0, this.spawnBlockY - this.pos.y));
            context.save();
            context.beginPath();
            context.rect(0, 0, this.size.x, clipH);
            context.clip();
            context.fillStyle = 'orange';
            context.fillRect(0, 0, this.size.x, this.size.y);
            context.restore();
            return;
        }

        context.fillStyle = 'orange';
        context.fillRect(0, 0, this.size.x, this.size.y);
    }
}
