import Entity from './Entity.js';
import { Trait, Killable } from './Traits.js';

class FireballBehavior extends Trait {
    constructor() {
        super('fireballBehavior');
    }

    collides(entity, candidate) {
        if (entity.killable.dead || candidate.item) return;

        if (candidate.hide) {
            candidate.hide();
            entity.killable.kill();
            return;
        }

        if (candidate.killable && !candidate.killable.dead) {
            candidate.killable.kill();
            entity.killable.kill(); // Destroy fireball on impact
        }
    }
}

class FireballPhysics extends Trait {
    constructor() {
        super('physics');
    }

    update(entity, deltaTime, level) {
        if (entity.bounceCooldown > 0) {
            entity.bounceCooldown -= deltaTime;
        }

        entity.pos.x += entity.vel.x * deltaTime;
        level.tileCollider.checkX(entity);

        entity.pos.y += entity.vel.y * deltaTime;
        level.tileCollider.checkY(entity);

        entity.vel.y += level.gravity * deltaTime;
    }

    obstruct(entity, side, match) {
        if (entity.killable.dead) return;

        if (side === 'bottom') {
            if (entity.bounceCooldown > 0) return;
            entity.bounceCooldown = 0.05;
            entity.bounceCount += 1;
            if (entity.bounceCount > entity.maxBounces) {
                entity.killable.kill();
                return;
            }
            entity.pos.y = match.y1 - entity.size.y;
            entity.vel.y = -entity.bounceSpeed;
            return;
        }

        if (side === 'top') {
            entity.pos.y = match.y2;
        } else if (side === 'left') {
            entity.pos.x = match.x2;
        } else if (side === 'right') {
            entity.pos.x = match.x1 - entity.size.x;
        }
        entity.vel.x = 0;
        entity.killable.kill();
    }
}

export default class Fireball extends Entity {
    constructor() {
        super();
        this.addTrait(new FireballPhysics());
        this.addTrait(new FireballBehavior());
        this.addTrait(new Killable());

        this.projectile = true;
        this.size.set(8, 8);
        this.vel.set(380, 380);
        this.bounceSpeed = 350;
        this.bounceCount = 0;
        this.maxBounces = 2;
        this.bounceCooldown = 0;
        this.killable.removeAfter = 0;
    }

    render(context) {
        context.fillStyle = '#ffaa00';
        context.beginPath();
        context.arc(this.size.x / 2, this.size.y / 2, 4, 0, Math.PI * 2);
        context.fill();
    }
}
