import { Trait } from './Traits.js';

export default class Item extends Trait {
    constructor() {
        super('item');
    }

    collides(entity, candidate) {
        if (candidate.mario) {
            entity.collect(candidate);
        }
    }

    collect(mario) {
        // To be implemented by subclasses
    }
}
