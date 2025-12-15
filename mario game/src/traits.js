export class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update(entity, deltaTime) {
        console.warn('Unhandled update call in Trait');
    }

    obstruct(entity, side) {
        // Optional
    }
}

export class Velocity extends Trait {
    constructor() {
        super('velocity');
    }

    update(entity, deltaTime) {
        // entity.pos.x += entity.vel.x * deltaTime;
        // entity.pos.y += entity.vel.y * deltaTime;
        // We let the Physics Engine (Level) handle the integration for now to control order of operations
    }
}

export class Go extends Trait {
    constructor() {
        super('go');
        this.dir = 0;
        this.speed = 6000;
        this.distance = 0;
    }

    update(entity, deltaTime) {
        entity.vel.x = this.speed * this.dir * deltaTime;
        if (this.dir) {
            this.distance += Math.abs(entity.vel.x * deltaTime);
        } else {
            this.distance = 0;
        }
    }
}

export class Jump extends Trait {
    constructor() {
        super('jump');
        this.duration = 0.5;
        this.velocity = 200;
        this.engageTime = 0;
        this.ready = 0;
        this.gracePeriod = 0.1; // Coyote time could go here, but simple ready check 
    }

    start() {
        if (this.ready > 0) {
            this.engageTime = this.duration;
        }
    }

    cancel() {
        this.engageTime = 0;
    }

    obstruct(entity, side) {
        if (side === 'bottom') {
            this.ready = 1;
        } else if (side === 'top') {
            this.cancel();
        }
    }

    update(entity, deltaTime) {
        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.engageTime -= deltaTime;
        }
        this.ready--;
    }
}
