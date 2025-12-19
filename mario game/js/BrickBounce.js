import Entity from './Entity.js';
import { Trait } from './Traits.js';

export default class BrickBounce extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.lifeTime = 0;
        this.duration = 0.2; // Bounce duration
        this.initialY = 0;
    }

    setup(pos) {
        this.pos.set(pos.x, pos.y);
        this.initialY = pos.y;
        this.vel.set(0, -100);
    }

    update(deltaTime, level) {
        this.lifeTime += deltaTime;
        if (this.lifeTime > this.duration) {
            level.entities.delete(this);
            // Restore block in level - callback or passed function
            if (this.restore) this.restore();
            return;
        }

        this.pos.y = this.initialY + Math.sin(Math.PI * (this.lifeTime / this.duration)) * -8;
    }

    render(context) {
        // Assume sprites[0] is the brick sprite, or we use a specific animation
        // Simple fallback for now
        context.fillStyle = '#b84e00';
        context.fillRect(0, 0, this.size.x, this.size.y);

        // Better: use actual brick sprite if available in sprites
        // this.sprites.draw('brick', context, 0, 0); 
    }
}
