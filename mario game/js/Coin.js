import Entity from './Entity.js';
import Item from './Item.js';
import { Killable } from './Traits.js';

export default class Coin extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.addTrait(new Item());
        this.addTrait(new Killable());
        this.killable.removeAfter = 0;
    }

    collect(mario) {
        if (mario.player) {
            mario.player.addCoin();
        }
        this.killable.kill();
    }

    kill() {
        // Implementation for removing from level
    }

    render(context) {
        context.fillStyle = 'gold';
        context.fillRect(0, 0, this.size.x, this.size.y);
    }
}
