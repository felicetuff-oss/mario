import Entity from '../Entity.js';
import SpriteSheet from '../SpriteSheet.js';
import { getImage } from '../Assets.js';
import { Velocity, Trait } from '../traits.js';
import { Killable, Stomper } from '../interactionTraits.js';

export function loadGoombaSprite() {
    const image = getImage('goomba');
    const sprite = new SpriteSheet(image, 16, 16);

    sprite.define('dead', 0, 0, 16, 16);
    sprite.define('walk-1', 16, 0, 16, 16);
    sprite.define('walk-2', 32, 0, 16, 16);

    return sprite;
}

class PendulumWalk extends Trait {
    constructor() {
        super('pendulumWalk');
        this.speed = -30;
    }

    obstruct(entity, side) {
        if (side === 'left' || side === 'right') {
            this.speed = -this.speed;
        }
    }

    update(entity, deltaTime) {
        entity.vel.x = this.speed;
    }
}

export function createGoomba() {
    const goomba = new Entity();
    goomba.size.set(16, 16);

    goomba.addTrait(new Velocity());
    goomba.addTrait(new PendulumWalk());
    goomba.addTrait(new Killable());

    goomba.sprite = loadGoombaSprite();

    let animationTime = 0;

    goomba.draw = function (context) {
        if (this.killable.dead) {
            this.sprite.draw('dead', context, 0, 0);
            return;
        }

        animationTime += 1 / 60; // Approximate frame increment
        // Simple toggle for walk animation
        const frame = (Math.floor(animationTime * 10) % 2 === 0) ? 'walk-1' : 'walk-2';
        this.sprite.draw(frame, context, 0, 0);
    };

    return goomba;
}
