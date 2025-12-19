import BrickBounce from './BrickBounce.js';

import { PLAYER_STATES } from './PlayerData.js';

const BUMP_IMPULSE = -300;

function bumpEnemies(level, x, y) {
    const tileLeft = x * 16;
    const tileRight = tileLeft + 16;
    const tileTop = y * 16;

    level.entities.forEach(entity => {
        if (!entity.enemy || !entity.killable || entity.killable.dead) return;

        const entityBottom = entity.pos.y + entity.size.y;
        const overlapsX = entity.pos.x < tileRight && entity.pos.x + entity.size.x > tileLeft;
        const onTop = entityBottom >= tileTop - 1 && entity.pos.y < tileTop;

        if (overlapsX && onTop) {
            entity.killable.kill();
            entity.vel.x = 0;
            entity.vel.y = BUMP_IMPULSE;
            if (entity.solid) {
                entity.solid.enabled = false;
            }
            if (entity.pendulumMove) {
                entity.pendulumMove.enabled = false;
            }
            if (entity.killable.removeAfter > 0.6) {
                entity.killable.removeAfter = 0.6;
            }
        }
    });
}

export class TileTrait {
    constructor(name) {
        this.NAME = name;
    }

    handle(level, x, y, entity) {
        // To be implemented
    }
}

export class QuestionBlock extends TileTrait {
    constructor(item) {
        super('questionBlock');
        this.item = item;
        this.hits = 1;
    }

    handle(level, x, y, entity) {
        bumpEnemies(level, x, y);
        if (this.hits <= 0) return;

        this.hits--;
        level.tiles.set(x, y, { name: 'empty-block', type: 'solid' });

        // Spawn item
        if (this.item) {
            const spawned = this.item(entity);
            // Call spawn animation if available, otherwise just place
            if (spawned.spawn) {
                spawned.spawn(x * 16, y * 16); // Spawn at block position
            } else {
                spawned.pos.set(x * 16, (y - 1) * 16);
            }
            level.entities.add(spawned);
        }
    }
}

export class Brick extends TileTrait {
    constructor() {
        super('brick');
    }

    handle(level, x, y, entity) {
        bumpEnemies(level, x, y);
        if (entity.state === PLAYER_STATES.BIG || entity.state === PLAYER_STATES.FIRE) {
            level.tiles.set(x, y, undefined); // Destroy brick
            // Spawn debris logic could go here
        } else {
            // Bounce
            const previousTile = level.tiles.get(x, y);
            level.tiles.set(x, y, undefined); // Temporarily remove

            const bounce = new BrickBounce();
            bounce.setup({ x: x * 16, y: y * 16 });
            bounce.restore = () => {
                level.tiles.set(x, y, previousTile);
            };
            level.entities.add(bounce);
        }
    }
}
