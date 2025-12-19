export default class TileCollider {
    constructor(tileMatrix, level) {
        this.tiles = tileMatrix;
        this.level = level;
    }

    checkX(entity) {
        let x;
        if (entity.vel.x > 0) {
            x = entity.pos.x + entity.size.x;
        } else if (entity.vel.x < 0) {
            x = entity.pos.x;
        } else {
            return;
        }

        const matches = this.tiles.searchByRange(
            x, x,
            entity.pos.y, entity.pos.y + entity.size.y - 1);

        matches.forEach(match => {
            if (match.tile.type !== 'solid') {
                return;
            }

            if (entity.vel.x > 0) {
                if (entity.pos.x + entity.size.x > match.x1) {
                    entity.pos.x = match.x1 - entity.size.x;
                    entity.vel.x = 0;
                    entity.obstruct('right', match);
                }
            } else if (entity.vel.x < 0) {
                if (entity.pos.x < match.x2) {
                    entity.pos.x = match.x2;
                    entity.vel.x = 0;
                    entity.obstruct('left', match);
                }
            }
        });
    }

    checkY(entity) {
        let y;
        if (entity.vel.y > 0) {
            y = entity.pos.y + entity.size.y;
        } else if (entity.vel.y < 0) {
            y = entity.pos.y;
        } else {
            return;
        }

        const matches = this.tiles.searchByRange(
            entity.pos.x + 2, entity.pos.x + entity.size.x - 2,
            y, y);

        matches.forEach(match => {
            if (match.tile.type !== 'solid') {
                return;
            }

            if (entity.vel.y > 0) {
                if (entity.pos.y + entity.size.y > match.y1) {
                    entity.pos.y = match.y1 - entity.size.y;
                    entity.vel.y = 0;
                    entity.obstruct('bottom', match);
                }
            } else if (entity.vel.y < 0) {
                if (entity.pos.y < match.y2) {
                    entity.pos.y = match.y2;
                    entity.vel.y = 0;

                    if (match.tile.trait) {
                        match.tile.trait.handle(this.level, match.indexX, match.indexY, entity);
                    }

                    entity.obstruct('top', match);
                }
            }
        });
    }
}
