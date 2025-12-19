import Entity from './Entity.js';
import { PendulumMove, Solid, Physics, Killable } from './Traits.js';
import { createAnim } from './Animation.js';

function isStomp(candidate, enemy) {
    const candidateBottom = candidate.pos.y + candidate.size.y;
    const enemyMid = enemy.pos.y + enemy.size.y * 0.5;
    return candidateBottom <= enemyMid || candidate.vel.y > enemy.vel.y;
}

export default class Goomba extends Entity {
    constructor(sprites) {
        super();
        this.sprites = sprites;
        this.enemy = true;
        this.addTrait(new Physics());
        this.addTrait(new Solid());
        this.addTrait(new PendulumMove());
        this.addTrait(new Killable());

        this.pendulumMove.speed = -30;

        this.walkAnim = createAnim(['goomba-1', 'goomba-2'], 0.1);
    }

    update(deltaTime, level) {
        if (this.killable.dead) {
            this.vel.set(0, 0);
            super.update(deltaTime, level);
            return;
        }
        super.update(deltaTime, level);
    }

    collides(candidate) {
        if (this.killable.dead) return;

        if (candidate.stomper) {
            if (isStomp(candidate, this)) {
                this.killable.kill();
                if (candidate.player) {
                    candidate.player.addScore(100);
                }
            } else if (candidate.damage) {
                candidate.damage();
            }
        }
    }

    render(context) {
        if (this.killable.dead) {
            context.fillStyle = '#442200'; // Darker brown
            context.fillRect(0, 12, this.size.x, 4); // Flattened
        } else {
            const yOffset = Math.sin(this.lifeTime * 10) * 1;
            context.fillStyle = 'brown';
            context.fillRect(0, yOffset, this.size.x, this.size.y);
        }
    }

    routeFrame() {
        if (this.killable.dead) {
            return 'goomba-dead';
        }
        return this.walkAnim;
    }
}
