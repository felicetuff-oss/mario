export default class Dashboard {
    constructor() {
        this.time = 400;
        this.score = 0;
        this.coins = 0;
        this.state = 'small';
    }

    draw(context) {
        context.font = '8px Arial'; // NES-style fonts are usually blocky, but Arial 8px is a placeholder
        context.fillStyle = 'white';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        // Mario/Score
        context.fillText('MARIO', 16, 8);
        context.fillText(this.score.toString().padStart(6, '0'), 16, 16);

        // Coins
        context.fillText('x' + this.coins.toString().padStart(2, '0'), 96, 16);

        // World
        context.fillText('WORLD', 144, 8);
        context.fillText('1-1', 152, 16);

        // Time
        context.fillText('TIME', 208, 8);
        context.fillText(Math.ceil(this.time).toString().padStart(3, '0'), 216, 16);

        if (this.state === 'fire') {
            context.fillText('FIRE:J', 176, 24);
        }
    }

    update(deltaTime, player) {
        this.time -= deltaTime * 1.5; // Mario time moves faster
        this.score = player.score;
        this.coins = player.coins;
        this.state = player.state;

        if (this.time <= 0) {
            this.time = 0;
            // Handle timeout
        }
    }
}
