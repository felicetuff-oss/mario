export const PLAYER_STATES = {
    SMALL: 'small',
    BIG: 'big',
    FIRE: 'fire'
};

export default class Player {
    constructor() {
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.state = PLAYER_STATES.SMALL;
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    addScore(points) {
        this.score += points;
    }

    addCoin() {
        this.coins++;
        if (this.coins >= 100) {
            this.coins = 0;
            this.lives++;
        }
        this.addScore(200);
    }

    damage() {
        if (this.invincible) return;

        if (this.state === PLAYER_STATES.FIRE || this.state === PLAYER_STATES.BIG) {
            this.state = PLAYER_STATES.SMALL;
            this.startInvincibility(2);
        } else {
            this.die();
        }
    }

    die() {
        this.lives--;
        // Trigger death event or state change
    }

    startInvincibility(duration) {
        this.invincible = true;
        this.invincibleTimer = duration;
    }

    update(deltaTime) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }
}
