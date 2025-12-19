import EntityCollider from './EntityCollider.js';
import TileCollider from './TileCollider.js';
import Matrix from './Matrix.js';

export default class Level {
    constructor() {
        this.gravity = 1500;
        this.totalTime = 0;
        this.entities = new Set();
        this.pendingEntities = new Set();
        this.tiles = new Matrix();
        this.tileCollider = new TileCollider(this.tiles, this);
        this.entityCollider = new EntityCollider(this.entities);
    }

    update(deltaTime, camera) {
        this.entities.forEach(entity => {
            entity.update(deltaTime, this);
        });

        // Spawn entities
        if (camera) {
            const spawnX = camera.pos.x + 256 + 16; // View width + buffer
            [...this.pendingEntities].forEach(entity => {
                if (entity.pos.x < spawnX) {
                    this.entities.add(entity);
                    this.pendingEntities.delete(entity);
                }
            });
        }

        this.entities.forEach(entity => {
            this.entityCollider.check(entity);
        });

        this.totalTime += deltaTime;
    }

    getTileColor(name) {
        switch (name) {
            case 'ground': return '#884400';
            case 'brick': return '#ff4400';
            case 'question-block': return '#ffcc00';
            case 'empty-block': return '#777777';
            case 'pipe-top-left':
            case 'pipe-top-right':
            case 'pipe-side-left':
            case 'pipe-side-right': return '#00aa00';
            case 'stone': return '#994400';
            default: return 'rgba(0,0,0,0)';
        }
    }

    draw(context, camera) {
        context.save();
        context.translate(-camera.pos.x, -camera.pos.y);

        // Draw tiles within camera view
        const viewX = Math.floor(camera.pos.x / 16);
        const viewWidth = Math.ceil(256 / 16) + 1;

        for (let x = viewX; x < viewX + viewWidth; x++) {
            const column = this.tiles.grid[x];
            if (column) {
                column.forEach((tile, y) => {
                    if (!tile) return;
                    // Draw colored block
                    context.fillStyle = this.getTileColor(tile.name);
                    context.fillRect(x * 16, y * 16, 16, 16);

                    // Add outline for blocks
                    if (tile.name !== 'sky') {
                        context.strokeStyle = 'rgba(0,0,0,0.2)';
                        context.strokeRect(x * 16, y * 16, 16, 16);
                    }
                });
            }
        }

        this.entities.forEach(entity => {
            context.save();
            context.translate(entity.pos.x, entity.pos.y);
            entity.render(context);
            context.restore();
        });

        context.restore();
    }
}
