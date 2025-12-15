export default class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
        this.animations = new Map();
    }

    define(name, x, y, width, height) {
        this.tiles.set(name, { x, y, width, height });
    }

    defineAnim(name, animation) {
        this.animations.set(name, animation);
    }

    draw(name, context, x, y, flip = false) {
        const buffer = this.tiles.get(name);
        if (!buffer) return;

        context.save();
        if (flip) {
            context.translate(x + buffer.width, y);
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                buffer.x, buffer.y, buffer.width, buffer.height,
                0, 0, buffer.width, buffer.height
            );
        } else {
            context.drawImage(
                this.image,
                buffer.x, buffer.y, buffer.width, buffer.height,
                x, y, buffer.width, buffer.height
            );
        }
        context.restore();
    }

    drawAnim(name, context, x, y, distance) {
        const animation = this.animations.get(name);
        if (!animation) return;
        // Simple frame selection based on distance/time
        // For now, let's assume external frame index control or simple mod
        // This method might need specific logic for our game loop
    }
}
