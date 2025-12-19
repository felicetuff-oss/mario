import Entity from './Entity.js';
import { Jump, Go, Solid, Physics, Stomper } from './Traits.js';
import { PLAYER_STATES } from './PlayerData.js';
import { createAnim } from './Animation.js';
import Fireball from './Fireball.js';

export default class Mario extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.mario = true;
        this.state = PLAYER_STATES.SMALL;

        this.addTrait(new Go());
        this.addTrait(new Jump());
        this.addTrait(new Physics());
        this.addTrait(new Solid());
        this.addTrait(new Stomper());

        this.runAnim = createAnim(['run-1', 'run-2', 'run-3'], 10);

        this.fireCooldown = 0;
    }

    setState(nextState) {
        this.state = nextState;
        if (this.player) {
            this.player.state = nextState;
        }
    }

    shoot(level) {
        if (this.state !== PLAYER_STATES.FIRE) return;
        if (this.fireCooldown > 0) return;

        const fireball = new Fireball();
        fireball.pos.copy(this.pos);
        fireball.pos.x += this.go.heading > 0 ? this.size.x : -fireball.size.x;
        fireball.pos.y = this.pos.y - 3;
        fireball.vel.x = this.go.heading > 0 ? 380 : -380;
        fireball.vel.y = 380;

        level.entities.add(fireball);
        this.fireCooldown = 0.5; // Cooldown seconds
    }

    damage() {
        if (this.isDead) return;
        if (this.player && this.player.invincible) return;

        if (this.state === PLAYER_STATES.SMALL) {
            if (this.player) {
                this.player.die();
                this.player.state = PLAYER_STATES.SMALL;
            }
            this.die();
            return;
        }

        if (this.state === PLAYER_STATES.FIRE) {
            this.setState(PLAYER_STATES.BIG);
        } else {
            this.setState(PLAYER_STATES.SMALL);
        }

        if (this.player) {
            this.player.startInvincibility(2);
        }
    }

    die() {
        this.isDead = true;
        this.traits = [];
        this.vel.set(0, -500); // Jump up on death
    }

    update(deltaTime, level) {
        if (this.isDead) {
            this.pos.x += this.vel.x * deltaTime;
            this.pos.y += this.vel.y * deltaTime;
            this.vel.y += level.gravity * deltaTime;
            return;
        }

        if (this.player && this.player.state !== this.state) {
            this.player.state = this.state;
        }

        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime;
        }

        if (this.state === PLAYER_STATES.BIG || this.state === PLAYER_STATES.FIRE) {
            const oldHeight = this.size.y;
            this.size.set(16, 32);
            if (oldHeight !== 32) {
                this.pos.y -= (32 - oldHeight);
            }
        } else {
            const oldHeight = this.size.y;
            this.size.set(16, 16);
            if (oldHeight !== 16) {
                this.pos.y -= (16 - oldHeight);
            }
        }
        super.update(deltaTime, level);
    }

    render(context) {
        let yOffset = 0;
        if (this.go.distance > 0) {
            yOffset = Math.sin(this.go.distance * 0.5) * 2;
        }

        if (this.state === PLAYER_STATES.FIRE) {
            context.fillStyle = '#f7f7f7'; // Fire Mario base (white)
            context.fillRect(0, yOffset, this.size.x, this.size.y);
            context.fillStyle = '#cc0000'; // Red cap/overalls accent
            context.fillRect(0, yOffset, this.size.x, 6);
            context.fillStyle = '#ffcc66'; // Skin tone hint
            context.fillRect(4, yOffset + 8, 8, 6);
        } else if (this.state === PLAYER_STATES.BIG) {
            context.fillStyle = '#880000'; // Darker red/bigger look color
            context.fillRect(0, yOffset, this.size.x, this.size.y);
        } else {
            context.fillStyle = 'red';
            context.fillRect(0, yOffset, this.size.x, this.size.y);
        }

        // Eyes to show direction
        context.fillStyle = 'white';
        const isFlipped = this.go.heading < 0;
        if (isFlipped) {
            context.fillRect(2, 4 + yOffset, 3, 3);
        } else {
            context.fillRect(this.size.x - 5, 4 + yOffset, 3, 3);
        }
    }

    routeFrame() {
        if (this.jump.falling) {
            return 'jump';
        }

        if (this.go.distance > 0) {
            if ((this.vel.x > 0 && this.go.dir < 0) || (this.vel.x < 0 && this.go.dir > 0)) {
                return 'brake';
            }
            return this.runAnim;
        }

        return 'idle';
    }
}
