import Entity from './Entity.js';
import { Trait } from './Traits.js';
import { Killable } from './Traits.js';

class FlagBehavior extends Trait {
    constructor() {
        super('flagBehavior');
    }

    collides(entity, candidate) {
        if (candidate.mario) {
            if (candidate.reachedFlag) return; // Already triggered
            candidate.reachedFlag = true;

            // Trigger sequence
            // 1. Stop User Input (Need to implement mechanism for this)
            // 2. Slide down
            // 3. Walk to castle

            // For now, we'll implement a simple callback or direct manipulation
            if (entity.onTouch) {
                entity.onTouch(candidate);
            }
        }
    }
}

export default class Flag extends Entity {
    constructor() {
        super();
        this.addTrait(new FlagBehavior());
        this.size.set(16, 160); // Tall pole area

        // Callback to be assigned by Level or Game
        this.onTouch = null;
    }

    render(context) {
        // Render pole
        context.fillStyle = '#00aa00'; // Green pole
        context.fillRect(7, 0, 2, this.size.y);

        // Render flag (triangle) at top? 
        // Or render based on separate FlagTop entity?
        // Simple visualization for now
        context.fillStyle = 'white';
        context.fillRect(8, 8, 16, 16);
    }
}
