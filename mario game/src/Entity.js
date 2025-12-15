import { Vec2 } from './math.js';

export default class Entity {
    constructor() {
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.size = new Vec2(16, 16);
        this.traits = [];
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }

    update(deltaTime) {
        this.traits.forEach(trait => {
            trait.update(this, deltaTime);
        });
    }

    draw(context) {
        // To be implemented or handled by external sprite drawer
    }

    obstruct(side) {
        this.traits.forEach(trait => {
            if (trait.obstruct) {
                trait.obstruct(this, side);
            }
        });
    }

    collides(candidate) {
        this.traits.forEach(trait => {
            if (trait.collides) {
                trait.collides(this, candidate);
            }
        });
    }
}
