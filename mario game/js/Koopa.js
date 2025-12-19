import Entity from './Entity.js';
import { PendulumMove, Solid, Physics, Killable } from './Traits.js';
import { createAnim } from './Animation.js';

function isStomp(candidate, enemy) {
    const candidateBottom = candidate.pos.y + candidate.size.y;
    const enemyMid = enemy.pos.y + enemy.size.y * 0.5;
    return candidateBottom <= enemyMid || candidate.vel.y > enemy.vel.y;
}

export const KOOPA_STATES = {
    WALKING: 'walking',
    HIDING: 'hiding',
    PANIC: 'panic'
};

export default class Koopa extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.enemy = true;
        this.dangerous = false;
        this.state = KOOPA_STATES.WALKING;
        this.hideTime = 0;
        this.hideDuration = 5;
        this.stompCooldown = 0;
        this.panicSpeed = 300;
        this.walkSpeed = -30;

        this.addTrait(new Physics());
        this.addTrait(new Solid());
        this.addTrait(new PendulumMove());
        this.addTrait(new Killable());

        this.pendulumMove.speed = this.walkSpeed;

        this.walkAnim = createAnim(['koopa-1', 'koopa-2'], 0.1);
    }

    collides(candidate) {
        if (this.killable.dead) return;

        if (candidate.stomper) {
            if (this.stompCooldown > 0) return;
            if (isStomp(candidate, this)) {
                this.handleStomp(candidate);
            } else {
                this.handleTouch(candidate);
            }
        } else if (this.state === KOOPA_STATES.PANIC) {
            // Kill other enemies when sliding
            if (!candidate.item && candidate.killable && !candidate.killable.dead) {
                candidate.killable.kill();
                candidate.vel.set(0, -200); // Bounce the killed enemy
                if (candidate.solid) {
                    candidate.solid.enabled = false;
                }
            }
        }
    }

    handleStomp(candidate) {
        if (this.state === KOOPA_STATES.WALKING) {
            this.hide();
            this.stompCooldown = 0.2;
        } else if (this.state === KOOPA_STATES.HIDING) {
            this.panic(candidate);
            this.stompCooldown = 0.2;
        } else if (this.state === KOOPA_STATES.PANIC) {
            this.hide(); // Stop the shell
            this.stompCooldown = 0.2;
        }
    }

    handleTouch(candidate) {
        if (this.state === KOOPA_STATES.WALKING) {
            candidate.damage();
        } else if (this.state === KOOPA_STATES.HIDING) {
            this.panic(candidate); // Kick the shell
        } else if (this.state === KOOPA_STATES.PANIC) {
            candidate.damage();
        }
    }

    hide() {
        this.state = KOOPA_STATES.HIDING;
        this.hideTime = 0;
        this.pendulumMove.speed = 0;
        this.vel.x = 0;
        this.dangerous = false;
    }

    unhide() {
        this.state = KOOPA_STATES.WALKING;
        this.pendulumMove.speed = this.walkSpeed;
        this.dangerous = false;
    }

    panic(candidate) {
        this.state = KOOPA_STATES.PANIC;
        const dir = Math.sign(candidate.vel.x) || Math.sign(this.pos.x - candidate.pos.x);
        this.pendulumMove.speed = this.panicSpeed * (dir || 1);
        this.dangerous = true;
    }

    update(deltaTime, level) {
        super.update(deltaTime, level);

        if (this.stompCooldown > 0) {
            this.stompCooldown -= deltaTime;
        }

        if (this.state === KOOPA_STATES.HIDING) {
            this.hideTime += deltaTime;
            if (this.hideTime > this.hideDuration) {
                this.unhide();
            }
        }
    }

    render(context) {
        let yOffset = 0;
        if (this.killable.dead) {
            context.fillStyle = 'grey';
        } else if (this.state === KOOPA_STATES.HIDING || this.state === KOOPA_STATES.PANIC) {
            context.fillStyle = '#006600'; // Dark green shell
        } else {
            context.fillStyle = 'green';
            yOffset = Math.sin(this.lifeTime * 10) * 1;
        }

        context.fillRect(0, yOffset, this.size.x, this.size.y);

        // Eyes
        context.fillStyle = 'white';
        if (this.pendulumMove.speed > 0) {
            context.fillRect(this.size.x - 5, 4 + yOffset, 3, 3);
        } else {
            context.fillRect(2, 4 + yOffset, 3, 3);
        }
    }

    routeFrame() {
        if (this.killable.dead) return 'koopa-dead';

        if (this.state === KOOPA_STATES.HIDING || this.state === KOOPA_STATES.PANIC) {
            return 'koopa-shell';
        }

        return this.walkAnim;
    }
}
