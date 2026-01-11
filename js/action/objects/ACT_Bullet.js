//=============================================================================
// ACT_Bullet - Projectile System
//=============================================================================

/**
 * Projectile/bullet entity for shooting mechanics.
 * 
 * @class ACT_Bullet
 * @extends ACT_Entity
 */
function ACT_Bullet() {
    this.initialize.apply(this, arguments);
}

ACT_Bullet.prototype = Object.create(ACT_Entity.prototype);
ACT_Bullet.prototype.constructor = ACT_Bullet;

ACT_Bullet.prototype.initialize = function(x, y, angle, speed, owner) {
    ACT_Entity.prototype.initialize.call(this, x, y, 8, 8);
    
    this.type = 'bullet';
    this.addTag('bullet');
    
    /**
     * Who fired this bullet
     */
    this.owner = owner;
    
    /**
     * Is this an enemy bullet?
     */
    this.isEnemyBullet = owner && owner.hasTag && owner.hasTag('enemy');
    
    if (this.isEnemyBullet) {
        this.addTag('enemyBullet');
    } else {
        this.addTag('playerBullet');
    }
    
    /**
     * Damage dealt
     */
    this.damage = 10;
    
    /**
     * Skill ID for damage calculation (RPG Maker integration)
     */
    this.skillId = 1;
    
    /**
     * Lifetime in frames
     */
    this.lifetime = 120;
    this.age = 0;
    
    /**
     * Bullet type (for visuals)
     */
    this.bulletType = 0;
    
    /**
     * Does this bullet pierce through targets?
     */
    this.piercing = false;
    
    /**
     * Does this bullet bounce off walls?
     */
    this.bounces = false;
    this.maxBounces = 3;
    this.bounceCount = 0;
    
    /**
     * Homing properties
     */
    this.isHoming = false;
    this.homingStrength = 0.05;
    this.homingTarget = null;
    
    // Configure body
    this.body.allowGravity = false;
    this.body.collidesWithTiles = true;
    
    // Set initial velocity
    if (angle !== undefined && speed !== undefined) {
        this.setDirection(angle, speed);
    }
};

/**
 * Set bullet direction and speed
 */
ACT_Bullet.prototype.setDirection = function(angle, speed) {
    this.body.velocity.x = Math.cos(angle) * speed;
    this.body.velocity.y = Math.sin(angle) * speed;
    this.angle = angle;
};

/**
 * Set bullet to aim at a target position
 */
ACT_Bullet.prototype.aimAt = function(targetX, targetY, speed) {
    var angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.setDirection(angle, speed);
};

ACT_Bullet.prototype.update = function(delta) {
    if (!this.active) return;
    
    this.age++;
    
    // Lifetime check
    if (this.age >= this.lifetime) {
        this.destroy();
        return;
    }
    
    // Homing behavior
    if (this.isHoming && this.homingTarget && this.homingTarget.active) {
        this.updateHoming();
    }
    
    // Wall collision
    if (this.body.blocked.left || this.body.blocked.right ||
        this.body.blocked.up || this.body.blocked.down) {
        this.onWallHit();
    }
    
    ACT_Entity.prototype.update.call(this, delta);
};

ACT_Bullet.prototype.updateHoming = function() {
    var targetAngle = Math.atan2(
        this.homingTarget.y - this.y,
        this.homingTarget.x - this.x
    );
    
    var currentAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    var speed = Math.sqrt(
        this.body.velocity.x * this.body.velocity.x +
        this.body.velocity.y * this.body.velocity.y
    );
    
    // Smoothly rotate toward target
    var angleDiff = targetAngle - currentAngle;
    
    // Normalize angle difference
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    currentAngle += angleDiff * this.homingStrength;
    
    this.body.velocity.x = Math.cos(currentAngle) * speed;
    this.body.velocity.y = Math.sin(currentAngle) * speed;
};

ACT_Bullet.prototype.onWallHit = function() {
    if (this.bounces && this.bounceCount < this.maxBounces) {
        this.bounceCount++;
        
        // Reflect velocity
        if (this.body.blocked.left || this.body.blocked.right) {
            this.body.velocity.x *= -1;
        }
        if (this.body.blocked.up || this.body.blocked.down) {
            this.body.velocity.y *= -1;
        }
    } else {
        this.destroy();
    }
};

ACT_Bullet.prototype.onOverlap = function(other) {
    // Don't hit owner
    if (other === this.owner) return;
    
    // Check valid targets
    var isValidTarget = false;
    
    if (this.isEnemyBullet && other.hasTag && other.hasTag('player')) {
        isValidTarget = true;
    } else if (!this.isEnemyBullet && other.hasTag && other.hasTag('enemy')) {
        isValidTarget = true;
    }
    
    if (isValidTarget) {
        this.hitTarget(other);
    }
};

ACT_Bullet.prototype.hitTarget = function(target) {
    if (target.takeDamage) {
        target.takeDamage(this.damage);
    }
    
    if (!this.piercing) {
        this.destroy();
    }
};

//=============================================================================
// ACT_BulletPool - Object Pool for Bullets
//=============================================================================

/**
 * Object pool for efficient bullet management.
 * 
 * @class ACT_BulletPool
 */
function ACT_BulletPool() {
    this.initialize.apply(this, arguments);
}

ACT_BulletPool.prototype.constructor = ACT_BulletPool;

ACT_BulletPool.prototype.initialize = function(maxBullets) {
    this.maxBullets = maxBullets || 100;
    this.pool = [];
    this.active = [];
    
    // Pre-allocate bullets
    for (var i = 0; i < this.maxBullets; i++) {
        var bullet = new ACT_Bullet(0, 0, 0, 0, null);
        bullet.active = false;
        this.pool.push(bullet);
    }
};

/**
 * Get a bullet from the pool
 */
ACT_BulletPool.prototype.get = function(x, y, angle, speed, owner) {
    var bullet = null;
    
    // Find inactive bullet
    for (var i = 0; i < this.pool.length; i++) {
        if (!this.pool[i].active) {
            bullet = this.pool[i];
            break;
        }
    }
    
    if (!bullet) {
        // Pool exhausted, reuse oldest active bullet
        if (this.active.length > 0) {
            bullet = this.active.shift();
        } else {
            return null;
        }
    }
    
    // Reset and configure bullet
    bullet.active = true;
    bullet.visible = true;
    bullet.setPosition(x, y);
    bullet.setDirection(angle, speed);
    bullet.owner = owner;
    bullet.isEnemyBullet = owner && owner.hasTag && owner.hasTag('enemy');
    bullet.age = 0;
    bullet.bounceCount = 0;
    
    this.active.push(bullet);
    
    return bullet;
};

/**
 * Return a bullet to the pool
 */
ACT_BulletPool.prototype.release = function(bullet) {
    bullet.active = false;
    bullet.visible = false;
    
    var index = this.active.indexOf(bullet);
    if (index >= 0) {
        this.active.splice(index, 1);
    }
};

/**
 * Update all active bullets
 */
ACT_BulletPool.prototype.update = function(delta) {
    for (var i = this.active.length - 1; i >= 0; i--) {
        var bullet = this.active[i];
        
        if (!bullet.active) {
            this.active.splice(i, 1);
            continue;
        }
        
        bullet.update(delta);
    }
};

/**
 * Clear all bullets
 */
ACT_BulletPool.prototype.clear = function() {
    for (var i = 0; i < this.active.length; i++) {
        this.active[i].active = false;
        this.active[i].visible = false;
    }
    this.active = [];
};

/**
 * Get all active bullets
 */
ACT_BulletPool.prototype.getActive = function() {
    return this.active;
};
