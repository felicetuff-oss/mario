import Level from './Level.js';
import { QuestionBlock, Brick } from './TileTraits.js';

export default class LevelLoader {
    constructor(loader) {
        this.loader = loader;
    }

    async load(name, entityFactory, itemFactory) {
        const levelSpec = await this.loader.loadJSON(name, `levels/${name}.json`);
        const level = new Level();

        // Setup tiles and layers
        if (levelSpec.layers) { // Retain original check for layers
            levelSpec.layers.forEach(layer => {
                layer.tiles.forEach(tileSpec => {
                    tileSpec.ranges.forEach(range => {
                        const [x1, x2, y1, y2, ...extras] = range;

                        const overrides = {};
                        for (let i = 0; i < extras.length; i += 2) {
                            if (extras[i] && extras[i + 1]) {
                                overrides[extras[i]] = extras[i + 1];
                            }
                        }

                        for (let x = x1; x < x2; x++) {
                            for (let y = y1; y < y2; y++) {
                                const tile = {
                                    name: tileSpec.name,
                                    type: tileSpec.type
                                };

                                const traitType = overrides.trait || tileSpec.trait;
                                const itemName = overrides.item || tileSpec.item;

                                if (traitType) {
                                if (traitType === 'questionBlock') {
                                    tile.trait = new QuestionBlock((entity) => itemFactory[itemName](entity));
                                    } else if (traitType === 'brick') {
                                        tile.trait = new Brick();
                                    }
                                }

                                level.tiles.set(x, y, tile);
                            }
                        }
                    });
                });
            });
        }

        // Setup pipes
        if (levelSpec.pipes) {
            levelSpec.pipes.forEach(p => {
                for (let y = 13 - p.h; y < 13; y++) {
                    const isTop = y === (13 - p.h);
                    level.tiles.set(p.x, y, {
                        name: isTop ? 'pipe-top-left' : 'pipe-side-left',
                        type: 'solid'
                    });
                    level.tiles.set(p.x + 1, y, {
                        name: isTop ? 'pipe-top-right' : 'pipe-side-right',
                        type: 'solid'
                    });
                }
            });
        }

        // Setup entities
        if (levelSpec.entities && entityFactory) {
            levelSpec.entities.forEach(entitySpec => {
                const createEntity = entityFactory[entitySpec.name];
                if (createEntity) {
                    const entity = createEntity();
                    entity.pos.set(entitySpec.pos[0] * 16, entitySpec.pos[1] * 16);
                    level.pendingEntities.add(entity);
                } else {
                    console.warn(`Unknown entity type: ${entitySpec.name}`);
                }
            });
        }

        return level;
    }
}
