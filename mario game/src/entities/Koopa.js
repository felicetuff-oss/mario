import Entity from '../Entity.js';
import SpriteSheet from '../SpriteSheet.js';
import { getImage } from '../Assets.js';
import { Velocity, Trait } from '../traits.js';
import { Killable } from '../interactionTraits.js';

export function loadKoopaSprite() {
    const image = getImage('koopa');
    const sprite = new SpriteSheet(image, 16, 24); // Text says "occupies 32 pixel grid space" but "actual pixels in lower part". Let's try 16x24 or 16x32. Text says "height... image occupies 32 pixel... actual pixels aligned to bottom".
    // Let's assume 16x32 for safety and offset drawing.

    // 0: Shell
    sprite.define('shell', 0, 0, 16, 32);
    // 1: Revive
    sprite.define('revive', 16, 0, 16, 32);
    // 2: Walk Left 1
    sprite.define('walk-left-1', 32, 0, 16, 32);
    // 3: Walk Left 2
    sprite.define('walk-left-2', 48, 0, 16, 32);

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

export function createKoopa() {
    const koopa = new Entity();
    koopa.size.set(16, 16); // Hitbox size
    // Visual size is 16x32, we need to offset draw

    koopa.addTrait(new Velocity());
    koopa.addTrait(new PendulumWalk());
    koopa.addTrait(new Killable());

    koopa.sprite = loadKoopaSprite();

    let animationTime = 0;

    koopa.draw = function (context) {
        if (this.killable.dead) {
            // For now, shell state
            this.sprite.draw('shell', context, 0, -16);
            return;
        }

        animationTime += 1 / 60;
        const frame = (Math.floor(animationTime * 10) % 2 === 0) ? 'walk-left-1' : 'walk-left-2';

        // Draw offset by -16 in Y because sprite is 32 high but entity is 16 high (bottom aligned)
        this.sprite.draw(frame, context, 0, -16);
    };

    return koopa;
}
