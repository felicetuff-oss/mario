export default class Matrix {
    constructor() {
        this.grid = [];
        this.tileSize = 16;
    }

    forEach(callback) {
        this.grid.forEach((column, x) => {
            column.forEach((value, y) => {
                callback(value, x, y);
            });
        });
    }

    set(x, y, value) {
        if (!this.grid[x]) {
            this.grid[x] = [];
        }
        if (value === undefined) {
            delete this.grid[x][y];
        } else {
            this.grid[x][y] = value;
        }
    }

    get(x, y) {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }

    searchByRange(x1, x2, y1, y2) {
        const matches = [];
        this.toIndexRange(x1, x2).forEach(indexX => {
            this.toIndexRange(y1, y2).forEach(indexY => {
                const tile = this.get(indexX, indexY);
                if (tile) {
                    matches.push({
                        tile,
                        indexX,
                        indexY,
                        x1: indexX * this.tileSize,
                        x2: (indexX + 1) * this.tileSize,
                        y1: indexY * this.tileSize,
                        y2: (indexY + 1) * this.tileSize,
                    });
                }
            });
        });
        return matches;
    }

    toIndexRange(pos1, pos2) {
        const p1 = Math.floor(pos1 / this.tileSize);
        const p2 = Math.floor(pos2 / this.tileSize);
        const range = [];
        for (let i = p1; i <= p2; i++) {
            range.push(i);
        }
        return range;
    }
}
