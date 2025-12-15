import Link from '../Entity.js'; // Mistake in thought process, importing Entity
import Entity from '../Entity.js';
import SpriteSheet from '../SpriteSheet.js';
import { getImage } from '../Assets.js';
import { Velocity, Go, Jump } from '../traits.js';

export function loadMarioSprite() {
    const image = getImage('mario0');
    const sprite = new SpriteSheet(image, 16, 16);

    // 1-5: Run Left (Small)
    // 0 * 16 = 0
    sprite.define('run-left-1', 0, 16, 16, 16); // Assuming bottom align y=16
    sprite.define('run-left-2', 16, 16, 16, 16);
    sprite.define('run-left-3', 32, 16, 16, 16);
    sprite.define('run-left-4', 48, 16, 16, 16);
    sprite.define('run-left-5', 64, 16, 16, 16);

    // 6: Idle Left (Small)
    sprite.define('idle-left', 80, 16, 16, 16);

    // 7: Big Idle Left
    sprite.define('idle-big-left', 96, 0, 16, 32);

    // 8: Big Idle Right
    sprite.define('idle-big-right', 112, 0, 16, 32);

    // 9: Idle Right (Small)
    sprite.define('idle-right', 128, 16, 16, 16);

    // 10-14: Run Right (Small)
    sprite.define('run-right-1', 144, 16, 16, 16);
    sprite.define('run-right-2', 160, 16, 16, 16);
    sprite.define('run-right-3', 176, 16, 16, 16);
    sprite.define('run-right-4', 192, 16, 16, 16);
    sprite.define('run-right-5', 208, 16, 16, 16);

    return sprite;
}

export function createMario() {
    const mario = new Entity();
    mario.size.x = 16;
    mario.size.y = 16;

    mario.addTrait(new Velocity());
    mario.addTrait(new Go());
    mario.addTrait(new Jump());

    mario.sprite = loadMarioSprite();

    mario.draw = function (context) {
        this.sprite.draw('idle-right', context, this.pos.x, this.pos.y);
    };

    return mario;
}
