//=============================================================================
// ACT_Body - Physics Body
//=============================================================================

/**
 * A physics body that can be attached to game entities.
 * Handles velocity, acceleration, collision detection, and response.
 * 
 * @class ACT_Body
 * @param {number} x - Initial X position (center)
 * @param {number} y - Initial Y position (center)
 * @param {number} width - Body width
 * @param {number} height - Body height
 */
function ACT_Body(x, y, width, height) {
    this.initialize.apply(this, arguments);
}

ACT_Body.prototype.constructor = ACT_Body;

ACT_Body.prototype.initialize = function(x, y, width, height) {
    /**
     * Reference to physics world
     * @type {ACT_Physics}
     */
    this.world = null;
    
    /**
     * Reference to owning entity
     * @type {Object}
     */
    this.entity = null;
    
    /**
     * Is this body enabled?
     */
    this.enable = true;
    
    /**
     * Is this a static (immovable) body?
     */
    this.isStatic = false;
    
    /**
     * Is this body immovable during collisions?
     */
    this.immovable = false;
    
    /**
     * Body dimensions
     */
    this.width = width || 32;
    this.height = height || 32;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    
    /**
     * Position (center point)
     * @type {ACT_Vector2}
     */
    this.position = new ACT_Vector2(x || 0, y || 0);
    
    /**
     * Previous position
     * @type {ACT_Vector2}
     */
    this.prev = new ACT_Vector2(x || 0, y || 0);
    
    /**
     * Velocity
     * @type {ACT_Vector2}
     */
    this.velocity = new ACT_Vector2(0, 0);
    
    /**
     * Acceleration
     * @type {ACT_Vector2}
     */
    this.acceleration = new ACT_Vector2(0, 0);
    
    /**
     * Drag (deceleration when not accelerating)
     * @type {ACT_Vector2}
     */
    this.drag = new ACT_Vector2(0.5, 0);
    
    /**
     * Bounce factor (0 = no bounce, 1 = full bounce)
     * @type {ACT_Vector2}
     */
    this.bounce = new ACT_Vector2(0, 0);
    
    /**
     * Local gravity (added to world gravity)
     * @type {ACT_Vector2}
     */
    this.gravity = new ACT_Vector2(0, 0);
    
    /**
     * Maximum velocity
     * @type {ACT_Vector2}
     */
    this.maxVelocity = new ACT_Vector2(300, 600);
    
    /**
     * Allow gravity to affect this body?
     */
    this.allowGravity = true;
    
    /**
     * Allow drag to affect this body?
     */
    this.allowDrag = true;
    
    /**
     * Collide with world bounds?
     */
    this.collideWorldBounds = false;
    
    /**
     * Collide with tilemap?
     */
    this.collidesWithTiles = true;
    
    /**
     * Collision flags
     */
    this.blocked = {
        none: true,
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    /**
     * Touching flags (from body-to-body collision)
     */
    this.touching = {
        none: true,
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    /**
     * Is on floor? (blocked.down or touching.down)
     */
    this.onFloor = false;
    
    /**
     * Is on wall? (blocked.left or blocked.right)
     */
    this.onWall = false;
    
    /**
     * Bounding box
     * @type {ACT_AABB}
     */
    this.bounds = new ACT_AABB(
        this.position.x - this.halfWidth,
        this.position.y - this.halfHeight,
        this.width,
        this.height
    );
    
    /**
     * Mass (for collision response)
     */
    this.mass = 1;
    
    /**
     * Custom data
     */
    this.data = {};
};

// Position getters/setters
Object.defineProperties(ACT_Body.prototype, {
    x: {
        get: function() { return this.position.x; },
        set: function(value) { this.position.x = value; }
    },
    y: {
        get: function() { return this.position.y; },
        set: function(value) { this.position.y = value; }
    },
    left: {
        get: function() { return this.position.x - this.halfWidth; }
    },
    right: {
        get: function() { return this.position.x + this.halfWidth; }
    },
    top: {
        get: function() { return this.position.y - this.halfHeight; }
    },
    bottom: {
        get: function() { return this.position.y + this.halfHeight; }
    },
    centerX: {
        get: function() { return this.position.x; }
    },
    centerY: {
        get: function() { return this.position.y; }
    }
});

/**
 * Reset collision flags
 */
ACT_Body.prototype.resetCollisionFlags = function() {
    this.blocked.none = true;
    this.blocked.up = false;
    this.blocked.down = false;
    this.blocked.left = false;
    this.blocked.right = false;
    
    this.touching.none = true;
    this.touching.up = false;
    this.touching.down = false;
    this.touching.left = false;
    this.touching.right = false;
    
    this.onFloor = false;
    this.onWall = false;
};

/**
 * Update bounding box from position
 */
ACT_Body.prototype.updateBounds = function() {
    this.bounds.x = this.position.x - this.halfWidth;
    this.bounds.y = this.position.y - this.halfHeight;
    this.bounds.width = this.width;
    this.bounds.height = this.height;
    
    // Update derived flags
    this.onFloor = this.blocked.down || this.touching.down;
    this.onWall = this.blocked.left || this.blocked.right;
    this.blocked.none = !this.blocked.up && !this.blocked.down && 
                        !this.blocked.left && !this.blocked.right;
};

/**
 * Set body size
 */
ACT_Body.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
    this.updateBounds();
};

/**
 * Set position
 */
ACT_Body.prototype.setPosition = function(x, y) {
    this.position.set(x, y);
    this.prev.set(x, y);
    this.updateBounds();
};

/**
 * Set velocity
 */
ACT_Body.prototype.setVelocity = function(x, y) {
    this.velocity.set(x, y);
};

/**
 * Set velocity X
 */
ACT_Body.prototype.setVelocityX = function(x) {
    this.velocity.x = x;
};

/**
 * Set velocity Y
 */
ACT_Body.prototype.setVelocityY = function(y) {
    this.velocity.y = y;
};

/**
 * Set acceleration
 */
ACT_Body.prototype.setAcceleration = function(x, y) {
    this.acceleration.set(x, y);
};

/**
 * Set drag
 */
ACT_Body.prototype.setDrag = function(x, y) {
    this.drag.set(x, y !== undefined ? y : x);
};

/**
 * Set bounce
 */
ACT_Body.prototype.setBounce = function(x, y) {
    this.bounce.set(x, y !== undefined ? y : x);
};

/**
 * Set max velocity
 */
ACT_Body.prototype.setMaxVelocity = function(x, y) {
    this.maxVelocity.set(x, y !== undefined ? y : x);
};

/**
 * Stop all movement
 */
ACT_Body.prototype.stop = function() {
    this.velocity.reset();
    this.acceleration.reset();
};

/**
 * Get delta X (change since last frame)
 */
ACT_Body.prototype.deltaX = function() {
    return this.position.x - this.prev.x;
};

/**
 * Get delta Y (change since last frame)
 */
ACT_Body.prototype.deltaY = function() {
    return this.position.y - this.prev.y;
};

/**
 * Check if moving
 */
ACT_Body.prototype.isMoving = function() {
    return this.velocity.x !== 0 || this.velocity.y !== 0;
};

/**
 * Get facing direction (-1 = left, 1 = right, 0 = none)
 */
ACT_Body.prototype.getFacing = function() {
    if (this.velocity.x < 0) return -1;
    if (this.velocity.x > 0) return 1;
    return 0;
};

/**
 * Distance to another body
 */
ACT_Body.prototype.distanceTo = function(other) {
    return this.position.distanceTo(other.position);
};

/**
 * Angle to another body (radians)
 */
ACT_Body.prototype.angleTo = function(other) {
    return this.position.angleTo(other.position);
};

/**
 * Check if overlapping another body
 */
ACT_Body.prototype.overlaps = function(other) {
    return this.bounds.intersects(other.bounds);
};

/**
 * Destroy this body
 */
ACT_Body.prototype.destroy = function() {
    if (this.world) {
        this.world.removeBody(this);
    }
    this.entity = null;
};
