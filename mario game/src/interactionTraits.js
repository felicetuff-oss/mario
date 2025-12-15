import { Trait } from './traits.js';

export class Killable extends Trait {
    constructor() {
        super('killable');
        this.dead = false;
        this.deadTime = 0;
        this.removeAfter = 2;
    }

    kill() {
        this.dead = true;
    }

    revive() {
        this.dead = false;
        this.deadTime = 0;
    }

    update(entity, deltaTime) {
        if (this.dead) {
            this.deadTime += deltaTime;
            if (this.deadTime > this.removeAfter) {
                // We need a way to remove entity from world.
                // For now, minimal logic.
                // In Level, we should filter out entities that signal removal.
            }
        }
    }
}

export class Stomper extends Trait {
    constructor() {
        super('stomper');
        this.queueBounce = false;
        this.bounceSpeed = 400;
    }

    bounce() {
        this.queueBounce = true;
    }

    update(entity, deltaTime) {
        if (this.queueBounce) {
            entity.vel.y = -this.bounceSpeed;
            this.queueBounce = false;
        }
    }

    collides(us, them) {
        if (!them.killable || them.killable.dead) {
            return;
        }

        if (us.vel.y > them.vel.y) {
            // bounce
            this.bounce();
            them.killable.kill();
        } else {
            // die
            if (us.killable) {
                us.killable.kill();
            }
        }
    }
}
