import { getImage } from './Assets.js';
import { createMario } from './entities/Mario.js';
import { createGoomba } from './entities/Goomba.js';
import { createKoopa } from './entities/Koopa.js';

class TileResolver {
    constructor(matrix, tileSize = 16) {
        this.matrix = matrix;
        this.tileSize = tileSize;
    }

    toIndex(pos) {
        return Math.floor(pos / this.tileSize);
    }

    searchByRange(x1, x2, y1, y2) {
        const matches = [];
        this.toIndexRange(x1, x2).forEach(indexX => {
            this.toIndexRange(y1, y2).forEach(indexY => {
                const match = this.getByIndex(indexX, indexY);
                if (match) {
                    matches.push(match);
                }
            });
        });
        return matches;
    }

    toIndexRange(pos1, pos2) {
        const pMax = Math.ceil(pos2 / this.tileSize) * this.tileSize;
        const range = [];
        let pos = pos1;
        do {
            range.push(this.toIndex(pos));
            pos += this.tileSize;
        } while (pos < pMax);
        return range;
    }

    getByIndex(indexX, indexY) {
        const tile = this.matrix.get(indexX, indexY);
        if (tile) {
            return {
                tile,
                x1: indexX * this.tileSize,
                x2: indexX * this.tileSize + this.tileSize,
                y1: indexY * this.tileSize,
                y2: indexY * this.tileSize + this.tileSize,
            };
        }
    }
}

// Simple Matrix for tile storage
class Matrix {
    constructor() {
        this.grid = [];
    }

    set(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }
        this.grid[x][y] = value;
    }

    get(x, y) {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }
}

export default class Level {
    constructor() {
        this.cameraX = 0;
        this.mapImage = null;
    }

    async load() {
        this.mapImage = getImage('map');
        this.tiles = new Matrix();

        // Scan map image for solid tiles
        const canvas = document.createElement('canvas');
        canvas.width = this.mapImage.width;
        canvas.height = this.mapImage.height;
        const context = canvas.getContext('2d');
        context.drawImage(this.mapImage, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Assuming sky is the top-left pixel color, or we define specific solid colors
        // For simplicity, let's treat sky blue as empty, everything else as solid
        // Actually, let's assume transparent or specific color index.
        // Let's debug by checking a known empty spot vs ground.
        // Ground is usually blocks. 
        // Simple scan: 16x16 grid. Check center pixel of each block.

        for (let x = 0; x < this.mapImage.width; x += 16) {
            for (let y = 0; y < this.mapImage.height; y += 16) {
                // Check pixel at center of tile
                const pX = x + 8;
                const pY = y + 8;
                const offset = (pY * this.mapImage.width + pX) * 4;
                const r = imageData.data[offset];
                const g = imageData.data[offset + 1];
                const b = imageData.data[offset + 2];
                const a = imageData.data[offset + 3];

                // Heuristic: specific sky color = empty
                // Sky Blue ~ rgb(92, 148, 252) -> #5C94FC
                // Black?
                // Let's assume if it is NOT sky blue, it is solid.
                // Or if alpha is 0.

                // For now, let's hardcode a check. 
                // If it's NOT the background color, add a tile.
                // Let's assume (92, 148, 252) is background.
                if (a !== 0 && !(r === 92 && g === 148 && b === 252)) {
                    this.tiles.set(x / 16, y / 16, { type: 'ground' });
                }
            }
        }

        this.tileResolver = new TileResolver(this.tiles);

        this.entities = new Set();
        this.mario = createMario();
        this.mario.pos.x = 64;
        this.mario.pos.y = 64;
        this.entities.add(this.mario);

        // Test Goomba
        const goomba = createGoomba();
        goomba.pos.x = 200;
        goomba.pos.y = 64;
        this.entities.add(goomba);

        // Test Koopa
        const koopa = createKoopa();
        koopa.pos.x = 220;
        koopa.pos.y = 64;
        this.entities.add(koopa);

        this.gravity = 1500;
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            entity.update(deltaTime);

            // X Collision
            entity.pos.x += entity.vel.x * deltaTime;
            this.checkX(entity);

            // Y Collision
            entity.pos.y += entity.vel.y * deltaTime;
            this.checkY(entity);

            // Apply Gravity
            entity.vel.y += this.gravity * deltaTime;
        });

        // Remove Dead Entities
        this.entities.forEach(entity => {
            // Check if entity has killable trait and is dead + removed
            // Simplified: if killable.deadTime > removeAfter
            if (entity.killable && entity.killable.dead && entity.killable.deadTime > entity.killable.removeAfter) {
                this.entities.delete(entity);
            }
        });

        // Entity Collision
        this.entities.forEach(entity => {
            this.entities.forEach(candidate => {
                if (entity === candidate) return;

                if (entity.pos.x < candidate.pos.x + candidate.size.x &&
                    entity.pos.x + entity.size.x > candidate.pos.x &&
                    entity.pos.y < candidate.pos.y + candidate.size.y &&
                    entity.pos.y + entity.size.y > candidate.pos.y) {

                    entity.collides(candidate);
                }
            });
        });

        // Camera follows Mario
        if (this.mario) {
            this.cameraX = this.mario.pos.x - 100;
        }
    }

    checkX(entity) {
        let match;
        if (entity.vel.x > 0) {
            if (match = this.tileResolver.searchByRange(entity.pos.x + entity.size.x, entity.pos.x + entity.size.x, entity.pos.y, entity.pos.y + entity.size.y)[0]) {
                if (match.tile.type === 'ground') {
                    entity.pos.x = match.x1 - entity.size.x;
                    entity.vel.x = 0;
                    entity.obstruct('right');
                }
            }
        } else if (entity.vel.x < 0) {
            if (match = this.tileResolver.searchByRange(entity.pos.x, entity.pos.x, entity.pos.y, entity.pos.y + entity.size.y)[0]) {
                if (match.tile.type === 'ground') {
                    entity.pos.x = match.x2;
                    entity.vel.x = 0;
                    entity.obstruct('left');
                }
            }
        }
    }

    checkY(entity) {
        let match;
        if (entity.vel.y > 0) {
            if (match = this.tileResolver.searchByRange(entity.pos.x, entity.pos.x + entity.size.x, entity.pos.y + entity.size.y, entity.pos.y + entity.size.y)[0]) {
                if (match.tile.type === 'ground') {
                    entity.pos.y = match.y1 - entity.size.y;
                    entity.vel.y = 0;
                    entity.obstruct('bottom');
                }
            }
        } else if (entity.vel.y < 0) {
            if (match = this.tileResolver.searchByRange(entity.pos.x, entity.pos.x + entity.size.x, entity.pos.y, entity.pos.y)[0]) {
                if (match.tile.type === 'ground') {
                    entity.pos.y = match.y2;
                    entity.vel.y = 0;
                    entity.obstruct('top');
                }
            }
        }
    }

    draw(context) {
        // Draw Map Layer
        if (this.mapImage) {
            // Clamp camera
            const maxCameraX = this.mapImage.width - 256;
            this.cameraX = Math.max(0, Math.min(this.cameraX, maxCameraX));

            context.drawImage(
                this.mapImage,
                Math.floor(this.cameraX), 0, 256, 240, // Source
                0, 0, 256, 240 // Destination
            );
        }

        // Draw Entities
        context.save();
        context.translate(-Math.floor(this.cameraX), 0);
        this.entities.forEach(entity => {
            entity.draw(context);
        });
        context.restore();
    }
}
