import { Vec2 } from './Entity.js';

export class Trait {
    constructor(name) {
        this.NAME = name;
    }

    obstruct() { }
    collides() { }

    update(entity, deltaTime, level) {
        // console.warn('Unhandled update call in Trait');
    }
}

export class Solid extends Trait {
    constructor() {
        super('solid');
    }

    obstruct(entity, side, match) {
        if (side === 'bottom') {
            entity.pos.y = match.y1 - entity.size.y;
            entity.vel.y = 0;
        } else if (side === 'top') {
            entity.pos.y = match.y2;
            entity.vel.y = 0;
        } else if (side === 'right') {
            entity.pos.x = match.x1 - entity.size.x;
            entity.vel.x = 0;
        } else if (side === 'left') {
            entity.pos.x = match.x2;
            entity.vel.x = 0;
        }
    }
}

export class Go extends Trait {
    constructor() {
        super('go');
        this.dir = 0;
        this.acceleration = 330;
        this.deceleration = 240;
        this.dragFactor = 1 / 5000;
        this.distance = 0;
        this.heading = 1;
        this.maxSpeed = 185;
    }

    update(entity, deltaTime, level) {
        const absX = Math.abs(entity.vel.x);

        if (this.dir !== 0) {
            entity.vel.x += this.acceleration * deltaTime * this.dir;
            this.heading = this.dir;
        } else if (entity.vel.x !== 0) {
            const decel = Math.min(absX, this.deceleration * deltaTime);
            entity.vel.x += entity.vel.x > 0 ? -decel : decel;
        } else {
            this.distance = 0;
        }

        const drag = this.dragFactor * entity.vel.x * absX;
        entity.vel.x -= drag;
        if (Math.abs(entity.vel.x) > this.maxSpeed) {
            entity.vel.x = Math.sign(entity.vel.x) * this.maxSpeed;
        }

        this.distance += absX * deltaTime;
    }
}

export class Jump extends Trait {
    constructor() {
        super('jump');
        this.duration = 0.32;
        this.velocity = 200;
        this.engageTime = 0;
        this.ready = 0;
        this.requestTime = 0;
        this.gracePeriod = 0.1;
    }

    get falling() {
        return this.ready < 0;
    }

    start() {
        this.requestTime = this.gracePeriod;
    }

    cancel() {
        this.engageTime = 0;
        this.requestTime = 0;
    }

    obstruct(entity, side) {
        if (side === 'bottom') {
            this.ready = 1;
        } else if (side === 'top') {
            this.cancel();
        }
    }

    update(entity, deltaTime, level) {
        if (this.requestTime > 0) {
            if (this.ready > 0) {
                this.engageTime = this.duration;
                this.requestTime = 0;
            }
            this.requestTime -= deltaTime;
        }

        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.engageTime -= deltaTime;
        }

        this.ready--;
    }
}

export class Physics extends Trait {
    constructor() {
        super('physics');
    }

    update(entity, deltaTime, level) {
        entity.pos.x += entity.vel.x * deltaTime;
        level.tileCollider.checkX(entity);

        entity.pos.y += entity.vel.y * deltaTime;
        level.tileCollider.checkY(entity);

        entity.vel.y += level.gravity * deltaTime;
    }
}

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

    update(entity, deltaTime, level) {
        if (this.dead) {
            this.deadTime += deltaTime;
            if (this.deadTime >= this.removeAfter) {
                level.entities.delete(entity);
            }
        }
    }
}

export class Stomper extends Trait {
    constructor() {
        super('stomper');
        this.bounceSpeed = 400;
    }

    isStomp(entity, candidate) {
        const entityBottom = entity.pos.y + entity.size.y;
        const candidateMid = candidate.pos.y + candidate.size.y * 0.5;
        return entityBottom <= candidateMid || entity.vel.y > candidate.vel.y;
    }

    bounce(entity) {
        entity.vel.y = -this.bounceSpeed;
    }

    collides(entity, candidate) {
        if (!candidate.killable || candidate.killable.dead || candidate.item || candidate.projectile) {
            return;
        }

        if (this.isStomp(entity, candidate)) {
            this.bounce(entity);
        }
    }
}

export class PendulumMove extends Trait {
    constructor() {
        super('pendulumMove');
        this.speed = -30;
    }

    update(entity, deltaTime) {
        entity.vel.x = this.speed;
    }

    obstruct(entity, side) {
        if (side === 'left' || side === 'right') {
            this.speed = -this.speed;
        }
    }
}
