export class Vec2 {
    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    copy(vec2) {
        this.x = vec2.x;
        this.y = vec2.y;
    }
}

export default class Entity {
    constructor() {
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.size = new Vec2(16, 16);
        this.offset = new Vec2(0, 0);
        this.traits = [];
        this.lifeTime = 0;
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }

    obstruct(side, match) {
        this.traits.forEach(trait => {
            trait.obstruct(this, side, match);
        });
    }

    collides(candidate) {
        this.traits.forEach(trait => {
            if (trait.enabled !== false) {
                trait.collides(this, candidate);
            }
        });
    }

    update(deltaTime, level) {
        this.traits.forEach(trait => {
            if (trait.enabled !== false) { // Support disabling traits
                trait.update(this, deltaTime, level);
            }
        });
        this.lifeTime += deltaTime;
    }

    render(context) {
        // To be implemented by subclasses
    }
}
