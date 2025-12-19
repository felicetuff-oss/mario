export default class EntityCollider {
    constructor(entities) {
        this.entities = entities;
    }

    check(subject) {
        this.entities.forEach(candidate => {
            if (subject === candidate) return;

            if (this.intersects(subject, candidate)) {
                if (subject.enemy && candidate.enemy && !subject.dangerous && !candidate.dangerous) {
                    const subjectMid = subject.pos.x + subject.size.x * 0.5;
                    const candidateMid = candidate.pos.x + candidate.size.x * 0.5;
                    const dx = candidateMid - subjectMid;

                    // Only handle once per pair.
                    if (dx > 0) {
                        const movingToward =
                            (subject.vel.x > 0 && candidate.vel.x < 0) ||
                            (subject.vel.x === 0 && candidate.vel.x < 0) ||
                            (subject.vel.x > 0 && candidate.vel.x === 0);

                        if (movingToward) {
                            if (subject.pendulumMove) {
                                subject.pendulumMove.speed = -subject.pendulumMove.speed;
                            }
                            if (candidate.pendulumMove) {
                                candidate.pendulumMove.speed = -candidate.pendulumMove.speed;
                            }
                        }

                        // Separate to avoid repeated flipping from overlap.
                        subject.pos.x -= 1;
                        candidate.pos.x += 1;
                    }
                }

                subject.collides(candidate);
                candidate.collides(subject);
            }
        });
    }

    intersects(rect1, rect2) {
        return rect1.pos.x < rect2.pos.x + rect2.size.x &&
            rect1.pos.x + rect1.size.x > rect2.pos.x &&
            rect1.pos.y < rect2.pos.y + rect2.size.y &&
            rect1.pos.y + rect1.size.y > rect2.pos.y;
    }
}
